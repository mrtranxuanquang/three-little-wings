// Three Little Wings — Gameplay scene (shared across all chapters)

import { CONFIG, CAMERA } from '../config.js';
import { Input } from '../input.js';
import { Character, STATE } from '../character.js';
import { DialogManager } from '../dialog.js';
import { SceneCutscenePlayer } from '../cutscene.js';
import { updateBody } from '../physics.js';

export class GameplayScene {
  constructor(game, chapterData) {
    this.game = game;
    this.chapter = chapterData;
    this.characters = {};       // { choe, cucu, chien }
    this.leaderId = chapterData.spawn.leader;
    this.cameraX = 0;
    this.cameraY = 0;
    this.cameraTargetX = 0;
    this.cameraShake = 0;

    this.dialog = new DialogManager({});
    this.cutscenePlayer = new SceneCutscenePlayer({
      assets: game.assets,
      dialog: this.dialog,
      audio: game.audio,
      inputRef: Input,
    });

    this.collectibles = [];      // { type, x, y, taken, id }
    this.props = [];             // scripted props (butterflies etc)
    this.firedTriggers = new Set();
    this.dynamicPlatforms = []; // platforms toggled by showPlatform/hidePlatform
    this.charAttachments = {};  // childId → parentId (hand-holding)

    // Input lock (cutscenes, forced movement)
    this.inputLocked = false;

    // UI state
    this.collectedCount = 0;
    this.totalCollectibles = 0;
    this.chapterBannerAlpha = 1;
    this.chapterBannerTime = 0;

    // End-of-chapter state
    this.chapterComplete = false;
  }

  async enter() {
    const ch = this.chapter;

    // Instantiate characters
    for (const id of CONFIG.CHARACTER_IDS) {
      this.characters[id] = new Character(id, ch.spawn.x, CONFIG.GROUND_Y, this.game.assets);
    }
    // Stagger spawn slightly (followers slightly behind)
    const order = CONFIG.CHARACTER_IDS.filter(c => c !== this.leaderId);
    this.characters[order[0]].x = ch.spawn.x - 110;
    this.characters[order[1]].x = ch.spawn.x - 220;

    this.dialog.characters = this.characters;

    // Collectibles
    this.collectibles = (ch.collectibles || []).map((c, i) => ({ ...c, taken: false, id: `c${i}`, bobPhase: Math.random()*Math.PI*2 }));
    this.totalCollectibles = this.collectibles.length;

    // NPCs (non-controllable story characters, e.g. Bố Quang)
    for (const npc of (ch.npcs || [])) {
      this.characters[npc.id] = new Character(npc.id, npc.x, CONFIG.GROUND_Y, this.game.assets);
      if (npc.facing != null) this.characters[npc.id].facing = npc.facing;
    }

    // Dynamic platforms (initially hidden, revealed by showPlatform cmd)
    this.dynamicPlatforms = (ch.dynamicPlatforms || []).map(p => ({ ...p, visible: p.visible ?? false }));
    this.charAttachments = {};

    // Start BGM
    if (ch.bgm) this.game.audio.playBgm(`audio/${ch.bgm}.mp3`, { fadeMs: 2000 });

    // Chapter banner
    this.chapterBannerTime = 0;
    this.chapterBannerAlpha = 0;

    // Fire any onEnter triggers at x=0 (intro cutscene)
    this._checkTriggers(true);
  }

  async exit() {
    this.dialog.clear();
    this.cutscenePlayer.stop();
  }

  update(dt) {
    // Inline script always advances (regardless of dialog/cutscene mode),
    // so scripted moves + say commands can flow naturally together.
    this._updateInlineScript(dt);

    // Global input handlers
    if (this.cutscenePlayer.active) {
      // Cutscene mode: only advance/skip
      if (Input.consumePressed('advance') || Input.consumePressed('jump')) {
        this.cutscenePlayer.advance();
      }
      if (Input.wasPressed('pause')) {
        this.cutscenePlayer.skip();
      }
      this.cutscenePlayer.update(dt);
      this.dialog.update(dt);
      return;
    }

    // Dialog mode (but not in cutscene): advance dialog, but keep scripted
    // moves & characters animating so the world doesn't freeze mid-cutscene.
    if (this.dialog.isActive()) {
      if (Input.consumePressed('advance') || Input.consumePressed('jump')) {
        this.dialog.advance();
      }
      this.dialog.update(dt);
      // Run scripted moves + animations for all characters so cutscenes feel alive
      this._updateScriptedMoves(dt);
      for (const id of CONFIG.CHARACTER_IDS) {
        const c = this.characters[id];
        c.idlePhase += dt * 3;
        // Advance frame animation only
        const pose = c.state && c.assets ? null : null;
      }
      // Props still animate (butterflies etc)
      for (const p of this.props) if (p.update) p.update(dt);
      return;
    }

    // Character switching
    if (!this.inputLocked) {
      if (Input.consumePressed('switch1')) this._switchLeader('choe');
      if (Input.consumePressed('switch2')) this._switchLeader('cucu');
      if (Input.consumePressed('switch3')) this._switchLeader('chien');
    }

    // Update characters
    const leader = this.characters[this.leaderId];
    const platforms = this._getActivePlatforms();

    // Leader — player controls
    if (!this.inputLocked) {
      leader.update(dt, Input, platforms, true);
    } else {
      // Frozen: still apply gravity but no input
      leader.vx = 0;
      leader.update(dt, null, platforms, false);
    }

    // Clamp leader in world
    leader.x = Math.max(50, Math.min(this.chapter.worldWidth - 50, leader.x));

    // Followers — compute smoothed "follow side" so leader direction changes
    // don't teleport followers to the other side instantly.
    if (this._followSide === undefined) this._followSide = leader.facing;
    // Track pending direction change; commit only after leader has moved in
    // the new direction for a bit (avoids jitter from momentary turns).
    if (leader.facing !== this._followSide) {
      this._followSwitchTimer = (this._followSwitchTimer || 0) + dt;
      // Commit if we've been facing the new direction for 0.4s OR
      // moving significantly in it
      if (this._followSwitchTimer > 0.4 || Math.abs(leader.vx) > CONFIG.WALK_SPEED * 1.4) {
        this._followSide = leader.facing;
        this._followSwitchTimer = 0;
      }
    } else {
      this._followSwitchTimer = 0;
    }
    const offsetSign = this._followSide;
    let offset = -offsetSign * CONFIG.FOLLOW_DISTANCE;
    for (const id of CONFIG.CHARACTER_IDS) {
      if (id === this.leaderId) continue;
      const follower = this.characters[id];
      // Skip follow AI if character is being driven by a scripted move —
      // otherwise the two systems fight and cause jitter/teleport.
      if (!follower._scriptedMove && !this.charAttachments[id]) {
        follower.followUpdate(leader, offset, dt, platforms);
      }
      offset += -offsetSign * CONFIG.FOLLOW_DISTANCE * 0.55;
    }

    // Attached chars (hand-holding): snap child beside parent
    for (const [childId, parentId] of Object.entries(this.charAttachments)) {
      const child = this.characters[childId];
      const parent = this.characters[parentId];
      if (!child || !parent) continue;
      const targetX = parent.x + parent.facing * -80;
      child.x += (targetX - child.x) * Math.min(1, dt * 10);
      child.y = parent.y;
      child.facing = parent.facing;
    }

    // Camera follow
    const dz = CAMERA.DEADZONE_X;
    const targetCx = leader.x + leader.facing * CAMERA.LOOK_AHEAD;
    const screenCx = this.cameraX + CONFIG.LOGICAL_WIDTH / 2;
    if (targetCx > screenCx + dz) this.cameraTargetX = targetCx - dz - CONFIG.LOGICAL_WIDTH/2;
    else if (targetCx < screenCx - dz) this.cameraTargetX = targetCx + dz - CONFIG.LOGICAL_WIDTH/2;

    this.cameraTargetX = Math.max(0, Math.min(this.chapter.worldWidth - CONFIG.LOGICAL_WIDTH, this.cameraTargetX));
    this.cameraX += (this.cameraTargetX - this.cameraX) * CAMERA.LERP;

    // Camera shake decay
    if (this.cameraShake > 0) this.cameraShake = Math.max(0, this.cameraShake - dt * 20);

    // Collectibles: check pickup by leader
    for (const c of this.collectibles) {
      if (c.taken) continue;
      const dx = leader.x - c.x;
      const dy = (leader.y - leader.height/2) - c.y;
      if (dx*dx + dy*dy < 80*80) {
        c.taken = true;
        this.collectedCount++;
        this.game.audio.playSfx('audio/sfx_pickup.mp3');
      }
      c.bobPhase += dt * 3;
    }

    // Update props
    for (const p of this.props) if (p.update) p.update(dt);

    // Scripted moves (cmd: 'moveChar') — run here with real dt instead of in draw()
    this._updateScriptedMoves(dt);

    // Check triggers
    this._checkTriggers(false);

    // Chapter banner fade in/out
    this.chapterBannerTime += dt;
    if (this.chapterBannerTime < 0.5) {
      this.chapterBannerAlpha = this.chapterBannerTime / 0.5;
    } else if (this.chapterBannerTime < 3.0) {
      this.chapterBannerAlpha = 1;
    } else if (this.chapterBannerTime < 4.0) {
      this.chapterBannerAlpha = 1 - (this.chapterBannerTime - 3.0);
    } else {
      this.chapterBannerAlpha = 0;
    }

    // Dialog update
    this.dialog.update(dt);

    // Pause
    if (Input.wasPressed('pause')) this.game.togglePause();
  }

  _switchLeader(newId) {
    if (this.leaderId === newId) return;
    const old = this.characters[this.leaderId];
    old.vx = 0;
    this.leaderId = newId;
    this.game.audio.playSfx('audio/sfx_switch.mp3');

    // First-time-switch dialog
    const switchLine = {
      choe:  'Để anh dẫn đường!',
      cucu:  'Có em đây!',
      chien: 'Yay! Đến em rồi!',
    }[newId];
    const flagKey = `tlw_switch_${newId}`;
    if (!sessionStorage.getItem(flagKey)) {
      sessionStorage.setItem(flagKey, '1');
      this.dialog.say(newId, switchLine, { duration: 1500, waitForInput: false });
    }
  }

  _getActivePlatforms() {
    return [
      ...(this.chapter.platforms || []),
      ...this.dynamicPlatforms.filter(p => p.visible),
    ];
  }

  _checkTriggers(forceEnterOnly) {
    const leader = this.characters[this.leaderId];
    for (const t of (this.chapter.triggers || [])) {
      if (t.once && this.firedTriggers.has(t.id)) continue;

      let fire = false;
      if (t.type === 'onEnter') {
        if (forceEnterOnly && t.x === 0) fire = true;
        else if (!forceEnterOnly && leader.x >= t.x && leader.x <= (t.x + (t.w || 80))) fire = true;
      } else if (t.type === 'afterDelay') {
        if (!this._delayTimers) this._delayTimers = new Map();
        // Don't start counting while input is locked (e.g. during intro cutscene).
        // Timer begins only when the player first has control.
        if (!this._delayTimers.has(t.id)) {
          if (this.inputLocked) continue;
          this._delayTimers.set(t.id, performance.now());
        }
        const since = performance.now() - this._delayTimers.get(t.id);
        if (since >= t.delay) fire = true;
      } else if (t.type === 'onCollect') {
        if (this.collectedCount >= (t.count || 1)) fire = true;
      }

      if (fire) {
        this.firedTriggers.add(t.id);
        this._fireEvent(t.event);
      }
    }
  }

  _fireEvent(eventName) {
    const timeline = this.chapter.events?.[eventName];
    if (!timeline) {
      console.warn('[Gameplay] no event:', eventName);
      return;
    }
    // Build a runtime for simple gameplay events (non-cutscene)
    this._runScriptedEvent(timeline, eventName);
  }

  /**
   * Execute a timeline of gameplay commands. This is the in-engine "cutscene"
   * that uses live sprites (not pre-composited scenes). If a timeline includes
   * a 'scene' command, it switches to the SceneCutscenePlayer instead.
   *
   * Supported gameplay cmds (in addition to all SceneCutscenePlayer cmds):
   *   { cmd:'freezeInput' }
   *   { cmd:'releaseInput' }
   *   { cmd:'setLeader', char }
   *   { cmd:'moveChar', char, toX, speed:'walk'|'run' }
   *   { cmd:'charState', char, state }        // STATE constant
   *   { cmd:'charPose',  char, sprite }        // set custom sprite key
   *   { cmd:'faceChar', char, dir }            // -1 | 1
   *   { cmd:'cameraTo', x, duration }
   *   { cmd:'cameraShake', amount }
   *   { cmd:'spawnProp', ... }
   *   { cmd:'completeChapter' }
   *   { cmd:'goToChapter', n }
   */
  _runScriptedEvent(timeline, name) {
    // If first cmd is 'scene', delegate to cutscene player
    const hasSceneCmd = timeline.some(c => c.cmd === 'scene' || c.cmd === 'crossfade');
    if (hasSceneCmd) {
      this.cutscenePlayer.play(timeline, { skippable: true });
      return;
    }

    // Inline gameplay timeline — driven by main update loop (not parallel RAF),
    // so it respects pause and main dt rather than wall-clock drift.
    this.scriptRunning = true;
    this.scriptTimeline = [...timeline].sort((a,b) => a.t - b.t);
    this.scriptCursor = 0;
    this.scriptElapsed = 0;  // accumulated from main dt; survives pause
    this.scriptName = name;

    // Fire all t=0 commands synchronously NOW so state (e.g. freezeInput)
    // is in effect before the next update tick runs. This prevents the
    // 1-frame window where the player could still move before freeze.
    while (this.scriptCursor < this.scriptTimeline.length &&
           this.scriptTimeline[this.scriptCursor].t <= 0) {
      const cmd = this.scriptTimeline[this.scriptCursor++];
      this._execGameplayCmd(cmd);
    }
    if (this.scriptCursor >= this.scriptTimeline.length) {
      this.scriptRunning = false;
    }
  }

  /** Advance the currently-running inline script by dt seconds. */
  _updateInlineScript(dt) {
    if (!this.scriptRunning) return;
    this.scriptElapsed += dt * 1000;
    while (this.scriptCursor < this.scriptTimeline.length &&
           this.scriptTimeline[this.scriptCursor].t <= this.scriptElapsed) {
      const cmd = this.scriptTimeline[this.scriptCursor++];
      this._execGameplayCmd(cmd);
    }
    if (this.scriptCursor >= this.scriptTimeline.length) {
      this.scriptRunning = false;
    }
  }

  _execGameplayCmd(cmd) {
    switch (cmd.cmd) {
      case 'freezeInput':
        this.inputLocked = true;
        for (const id of CONFIG.CHARACTER_IDS) this.characters[id].vx = 0;
        break;
      case 'releaseInput':
        this.inputLocked = false;
        break;
      case 'setLeader':
        this.leaderId = cmd.char;
        break;
      case 'faceChar': {
        const c = this.characters[cmd.char];
        if (c) c.facing = cmd.dir;
        break;
      }
      case 'moveChar': {
        const c = this.characters[cmd.char];
        if (!c) break;
        const targetX = cmd.toX;
        const speed = cmd.speed === 'run' ? CONFIG.RUN_SPEED : CONFIG.WALK_SPEED;
        c._scriptedMove = { targetX, speed, onDone: cmd.onDone };
        break;
      }
      case 'charState': {
        const c = this.characters[cmd.char];
        if (c) c.setState(cmd.state);
        break;
      }
      case 'charPose': {
        const c = this.characters[cmd.char];
        if (c) c.setState(STATE.CUSTOM, { sprite: cmd.sprite });
        break;
      }
      case 'charTeleport': {
        const c = this.characters[cmd.char];
        if (c) { c.x = cmd.x; c.y = cmd.y ?? CONFIG.GROUND_Y; c.vx = 0; c.vy = 0; }
        break;
      }
      case 'cameraTo':
        this.cameraTargetX = Math.max(0, Math.min(this.chapter.worldWidth - CONFIG.LOGICAL_WIDTH, cmd.x));
        break;
      case 'cameraShake':
        this.cameraShake = cmd.amount || 15;
        break;
      case 'say':
        this.dialog.say(cmd.char, cmd.text, { duration: cmd.duration, waitForInput: cmd.waitForInput !== false });
        break;
      case 'narrate':
        this.dialog.narrate(cmd.text, { duration: cmd.duration, waitForInput: cmd.waitForInput !== false, tutorial: cmd.tutorial });
        break;
      case 'bgm':
        this.game.audio.playBgm(`audio/${cmd.track}.mp3`, { fadeMs: cmd.fadeMs || 1500 });
        break;
      case 'sfx':
        this.game.audio.playSfx(`audio/${cmd.sfx}.mp3`);
        break;
      case 'spawnProp':
        this.props.push(createProp(cmd, this));
        break;
      case 'showPlatform': {
        const dp = this.dynamicPlatforms.find(p => p.id === cmd.id);
        if (dp) dp.visible = true;
        break;
      }
      case 'hidePlatform': {
        const dp = this.dynamicPlatforms.find(p => p.id === cmd.id);
        if (dp) dp.visible = false;
        break;
      }
      case 'attachChars':
        this.charAttachments[cmd.child] = cmd.parent;
        break;
      case 'detachChars':
        delete this.charAttachments[cmd.child];
        break;
      case 'removeProp':
        this.props = this.props.filter(p => p.id !== cmd.id);
        break;
      case 'goToChapter':
        this.chapterComplete = true;
        setTimeout(() => this.game.completeChapter(cmd.n, cmd.transition), cmd.delay || 300);
        break;
      case 'showTransition':
        this.chapterComplete = true;
        setTimeout(() => this.game.showChapterEnd(cmd.title, cmd.next), cmd.delay || 300);
        break;
      case 'callback':
        try { cmd.fn(this); } catch(e) { console.error(e); }
        break;
      default:
        console.warn('[Gameplay] unknown cmd:', cmd.cmd);
    }
  }

  draw(ctx) {
    const W = CONFIG.LOGICAL_WIDTH, H = CONFIG.LOGICAL_HEIGHT;

    // Cutscene fullscreen takes over
    if (this.cutscenePlayer.active && this.cutscenePlayer.currentSceneKey) {
      this.cutscenePlayer.draw(ctx, W, H);
      // Dialog still drawn over cutscene
      this.dialog.draw(ctx, { x: 0, y: 0 }, W, H);
      return;
    }
    // Draw background (parallax-stretched to worldWidth)
    this._drawBackground(ctx);

    // Camera transform
    const shakeX = this.cameraShake > 0 ? (Math.random() - 0.5) * this.cameraShake : 0;
    const shakeY = this.cameraShake > 0 ? (Math.random() - 0.5) * this.cameraShake : 0;
    ctx.save();
    ctx.translate(-this.cameraX + shakeX, -this.cameraY + shakeY);

    // Platforms (debug)
    if (CONFIG.DEBUG) {
      ctx.fillStyle = 'rgba(255,0,0,0.3)';
      for (const p of this._getActivePlatforms()) ctx.fillRect(p.x, p.y, p.w, p.h);
    }

    // Dynamic platforms (stone bridge style; supports color + glow)
    for (const p of this.dynamicPlatforms) {
      if (!p.visible) continue;
      ctx.save();
      const baseColor = p.color || '#8a7a68';
      const rimColor  = p.color ? '#3a6888' : '#4a3a28';
      if (p.glow) {
        const grd = ctx.createRadialGradient(
          p.x + p.w / 2, p.y - p.h / 2, 4,
          p.x + p.w / 2, p.y - p.h / 2, p.w * 0.75
        );
        grd.addColorStop(0, 'rgba(160,220,255,0.55)');
        grd.addColorStop(1, 'rgba(160,220,255,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(p.x - 20, p.y - p.h - 20, p.w + 40, p.h + 40);
      }
      ctx.fillStyle = baseColor;
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y - p.h, p.w, p.h, 6);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 2;
      for (let i = 1; i < 3; i++) {
        const sx = p.x + p.w * i / 3;
        ctx.beginPath(); ctx.moveTo(sx, p.y - p.h); ctx.lineTo(sx, p.y); ctx.stroke();
      }
      ctx.restore();
    }

    // Collectibles
    for (const c of this.collectibles) {
      if (c.taken) continue;
      this._drawFlower(ctx, c);
    }

    // Props (butterflies etc)
    for (const p of this.props) if (p.draw) p.draw(ctx);

    // Characters — draw in z-order: depth by y (higher y = in front)
    const charList = Object.values(this.characters).filter(Boolean);
    charList.sort((a, b) => a.y - b.y || (a.id === this.leaderId ? 1 : -1));
    for (const ch of charList) ch.draw(ctx);

    ctx.restore();

    // Dialog (screen space)
    this.dialog.draw(ctx, { x: this.cameraX, y: this.cameraY }, W, H);

    // HUD
    this._drawHUD(ctx);

    // Touch buttons overlay (Ghibli-style wooden buttons)
    if (this.game._drawTouchOverlay) {
      this._drawTouchButtons(ctx);
    }

    // Chapter banner
    if (this.chapterBannerAlpha > 0.01) this._drawChapterBanner(ctx);

    // Cutscene fade overlay (for fadeToBlack commands that span gameplay)
    if (this.cutscenePlayer.active && this.cutscenePlayer.fadeBlackAlpha > 0.001) {
      ctx.fillStyle = `rgba(0,0,0,${this.cutscenePlayer.fadeBlackAlpha})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  _drawBackground(ctx) {
    const bg = this.game.assets.get(this.chapter.background);
    if (!bg) {
      ctx.fillStyle = '#556b4e';
      ctx.fillRect(0, 0, CONFIG.LOGICAL_WIDTH, CONFIG.LOGICAL_HEIGHT);
      return;
    }
    // Stretch BG horizontally to cover world width (parallax factor 1 for now)
    // The BG is 1920x1080; we want to paint it across worldWidth px.
    // Simple approach: tile-scale. For Ch1 worldWidth = 2x screen, we show 2x-stretched BG that doesn't look too bad because art is painterly.
    // Better approach: scroll with parallax 0.6 (BG moves slower than world)
    const parallax = 0.6;
    const bgOffsetX = -this.cameraX * parallax;
    const bgScale = CONFIG.LOGICAL_HEIGHT / bg.height;
    const bgW = bg.width * bgScale;
    // Number of BG tiles needed to cover (worldWidth * parallax_ratio) visible area
    const startX = bgOffsetX % bgW;
    for (let x = startX - bgW; x < CONFIG.LOGICAL_WIDTH + bgW; x += bgW) {
      ctx.drawImage(bg, x, 0, bgW, CONFIG.LOGICAL_HEIGHT);
    }
  }

  _drawFlower(ctx, c) {
    const bob = Math.sin(c.bobPhase) * 6;
    const x = c.x, y = c.y + bob;
    // Glow
    const grd = ctx.createRadialGradient(x, y, 0, x, y, 50);
    grd.addColorStop(0, 'rgba(255, 220, 120, 0.6)');
    grd.addColorStop(1, 'rgba(255, 220, 120, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(x - 60, y - 60, 120, 120);
    // Petals (5)
    const colors = { flower: '#f3a9b8', starflower: '#ffd987' };
    ctx.fillStyle = c.type === 'starflower' ? colors.starflower : colors.flower;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a)*14, y + Math.sin(a)*14, 11, 16, a, 0, Math.PI*2);
      ctx.fill();
    }
    // Center
    ctx.fillStyle = '#fff4a3';
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI*2); ctx.fill();
  }

  _updateScriptedMoves(dt) {
    for (const id of Object.keys(this.characters)) {
      const c = this.characters[id];
      if (!c._scriptedMove) continue;
      const sm = c._scriptedMove;
      const dx = sm.targetX - c.x;
      if (Math.abs(dx) < 8) {
        c.x = sm.targetX;
        c.vx = 0;
        const onDone = sm.onDone;
        c._scriptedMove = null;
        c.setState(STATE.IDLE);
        if (onDone) { try { onDone(); } catch(e) { console.error(e); } }
        continue;
      }
      const dir = Math.sign(dx);
      c.vx = dir * sm.speed;
      c.facing = dir;
      // Drive horizontal motion ourselves; let updateBody handle gravity/ground.
      // We call updateBody with empty platforms to keep scripted chars on ground
      // without fighting platform collisions (intended for Ch1 ground-level scripts).
      const platforms = this._getActivePlatforms();
      updateBody(c, platforms, CONFIG.GROUND_Y, dt);
      if (sm.speed >= CONFIG.RUN_SPEED) c.setState(STATE.RUN);
      else c.setState(STATE.WALK);
    }
  }

  _drawTouchButtons(ctx) {
    const buttons = this.game.getLogicalTouchButtons();
    if (!buttons.length) return;
    ctx.save();
    // Overall touch UI transparency (don't fight with game world)
    for (const b of buttons) {
      if (b.id === 'sw1' || b.id === 'sw2' || b.id === 'sw3') {
        // Swap buttons already visible as portraits in _drawHUD; skip
        continue;
      }
      this._drawWoodenButton(ctx, b);
    }
    ctx.restore();
  }

  /**
   * Draw a Ghibli-style "wooden" tactile button.
   * b: { id, action, x, y, w, h, shape, held }
   */
  _drawWoodenButton(ctx, b) {
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    const r = Math.min(b.w, b.h) / 2;

    ctx.save();

    // --- Press animation: held = shrink slightly + darken ---
    const pressScale = b.held ? 0.94 : 1;
    const pressDarken = b.held ? 0.15 : 0;

    // Shadow underneath (pillow cast)
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6, r * 0.95, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Color palette by button type
    let baseColor, rimColor, iconColor;
    if (b.action === 'jump') {
      // Cream with amber accent — "up / light"
      baseColor = '#f5ead0';
      rimColor  = '#8a6b3e';
      iconColor = '#3a2a1a';
    } else if (b.action === 'skill') {
      // Warm red — "action / do"
      baseColor = '#c9614e';
      rimColor  = '#6e2a22';
      iconColor = '#fff3dc';
    } else {
      // Dpad left/right — warm wood
      baseColor = '#d4a574';
      rimColor  = '#5a3d24';
      iconColor = '#2a1e14';
    }

    // Radial gradient for 3D wood feel
    const grad = ctx.createRadialGradient(
      cx - r * 0.35, cy - r * 0.4, r * 0.1,
      cx, cy + r * 0.15, r
    );
    grad.addColorStop(0, this._lighten(baseColor, 0.22));
    grad.addColorStop(0.65, baseColor);
    grad.addColorStop(1, this._darken(baseColor, 0.25 + pressDarken));

    const rr = r * pressScale;

    // Outer rim (darker, wider)
    ctx.fillStyle = rimColor;
    ctx.beginPath();
    ctx.arc(cx, cy, rr + 4, 0, Math.PI * 2);
    ctx.fill();

    // Button face
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, rr, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight arc (top-left gloss)
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = this._lighten(baseColor, 0.4);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, rr - 6, Math.PI * 1.15, Math.PI * 1.75);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Icon glyph
    ctx.fillStyle = iconColor;
    ctx.strokeStyle = iconColor;
    ctx.lineWidth = Math.max(4, rr * 0.10);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (b.action === 'left' || b.action === 'right') {
      // Chevron arrow
      const dir = b.action === 'left' ? -1 : 1;
      const s = rr * 0.38;
      ctx.beginPath();
      ctx.moveTo(cx + dir * s * 0.4, cy - s);
      ctx.lineTo(cx - dir * s * 0.4, cy);
      ctx.lineTo(cx + dir * s * 0.4, cy + s);
      ctx.stroke();
    } else if (b.action === 'jump') {
      // Leaf + upward curl (organic, feels like flight)
      const s = rr * 0.55;
      ctx.beginPath();
      ctx.moveTo(cx, cy + s * 0.5);
      ctx.quadraticCurveTo(cx - s * 0.8, cy - s * 0.2, cx, cy - s * 0.9);
      ctx.quadraticCurveTo(cx + s * 0.8, cy - s * 0.2, cx, cy + s * 0.5);
      ctx.fill();
      // Leaf vein
      ctx.strokeStyle = this._darken(iconColor, 0.1);
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy + s * 0.45);
      ctx.lineTo(cx, cy - s * 0.85);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (b.action === 'skill') {
      // Small star / sparkle — "special ability"
      const s = rr * 0.42;
      ctx.fillStyle = iconColor;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
        const a2 = a + Math.PI / 4;
        ctx.lineTo(cx + Math.cos(a) * s, cy + Math.sin(a) * s);
        ctx.lineTo(cx + Math.cos(a2) * s * 0.4, cy + Math.sin(a2) * s * 0.4);
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  _lighten(hex, amt) {
    const { r, g, b } = this._hexToRgb(hex);
    return `rgb(${Math.min(255, r + (255-r)*amt)|0}, ${Math.min(255, g + (255-g)*amt)|0}, ${Math.min(255, b + (255-b)*amt)|0})`;
  }
  _darken(hex, amt) {
    const { r, g, b } = this._hexToRgb(hex);
    return `rgb(${(r*(1-amt))|0}, ${(g*(1-amt))|0}, ${(b*(1-amt))|0})`;
  }
  _hexToRgb(hex) {
    const h = hex.replace('#','');
    return {
      r: parseInt(h.substring(0,2), 16),
      g: parseInt(h.substring(2,4), 16),
      b: parseInt(h.substring(4,6), 16),
    };
  }

  _drawHUD(ctx) {
    const W = CONFIG.LOGICAL_WIDTH, H = CONFIG.LOGICAL_HEIGHT;

    // Character portraits top-right (3 circles, highlight active)
    const portraitSize = 80, gap = 14;
    const startX = W - 40 - portraitSize * 3 - gap * 2;
    const py = 40;
    for (let i = 0; i < 3; i++) {
      const id = CONFIG.CHARACTER_IDS[i];
      const px = startX + i * (portraitSize + gap);
      const active = id === this.leaderId;
      ctx.save();
      // Circle
      ctx.beginPath();
      ctx.arc(px + portraitSize/2, py + portraitSize/2, portraitSize/2, 0, Math.PI*2);
      ctx.fillStyle = active ? '#f5ead0' : 'rgba(20,22,18,0.7)';
      ctx.fill();
      ctx.strokeStyle = active ? '#d4a574' : 'rgba(245,234,208,0.5)';
      ctx.lineWidth = active ? 4 : 2;
      ctx.stroke();

      // Character color dot
      ctx.fillStyle = CONFIG.CHARACTER_COLORS[id];
      ctx.beginPath();
      ctx.arc(px + portraitSize/2, py + portraitSize/2, portraitSize/2 - 14, 0, Math.PI*2);
      ctx.fill();

      // Number
      ctx.fillStyle = '#fff';
      ctx.font = '700 32px "Be Vietnam Pro"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i+1), px + portraitSize/2, py + portraitSize/2);

      // Name below
      ctx.fillStyle = active ? '#f5ead0' : 'rgba(245,234,208,0.6)';
      ctx.font = '500 15px "Be Vietnam Pro"';
      ctx.textBaseline = 'top';
      ctx.fillText(CONFIG.CHARACTER_NAMES[id], px + portraitSize/2, py + portraitSize + 4);
      ctx.restore();
    }

    // Flower collectibles counter top-left
    if (this.totalCollectibles > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(20,22,18,0.7)';
      this._roundRect(ctx, 30, 30, 200, 56, 10);
      ctx.fill();
      ctx.fillStyle = '#f5ead0';
      ctx.font = '600 30px "Be Vietnam Pro"';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`🌸 ${this.collectedCount} / ${this.totalCollectibles}`, 52, 58);
      ctx.restore();
    }
  }

  _drawChapterBanner(ctx) {
    const W = CONFIG.LOGICAL_WIDTH, H = CONFIG.LOGICAL_HEIGHT;
    ctx.save();
    ctx.globalAlpha = this.chapterBannerAlpha;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.font = '500 italic 28px "Be Vietnam Pro"';
    ctx.fillText(`Chương ${this.chapter.number}`, W/2, 210);
    ctx.fillStyle = '#f5ead0';
    ctx.font = '700 58px "Be Vietnam Pro"';
    ctx.fillText(this.chapter.title, W/2, 270);
    ctx.restore();
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

// ---------- Props ----------

let _propIdCounter = 0;

function createProp(cmd, scene) {
  if (cmd.prop === 'butterfly') return createButterfly(cmd);
  if (cmd.prop === 'boulder')   return createBoulder(cmd, scene);
  return { id: `p${_propIdCounter++}`, update: () => {}, draw: () => {} };
}

function createBoulder({ id, x, y, triggerX, triggerEvent }, scene) {
  let vy = 0, rolling = false, done = false;
  const W = 120, H = 100;
  const obj = {
    id: id || `boulder${_propIdCounter++}`,
    x, y: y ?? CONFIG.GROUND_Y,
    update(dt) {
      if (done) return;
      // Gravity
      vy += 1200 * dt;
      this.y = Math.min(CONFIG.GROUND_Y, this.y + vy * dt);
      if (this.y >= CONFIG.GROUND_Y) vy = 0;

      // Skill push: only Chòe as leader, adjacent, holding Z
      const leader = scene.characters[scene.leaderId];
      if (!scene.inputLocked && scene.leaderId === 'choe' && leader) {
        const dx = this.x - leader.x;
        const near = Math.abs(dx) < 110 && Math.abs(this.y - leader.y) < 80;
        const facing = leader.facing * dx > 0;
        if (near && facing && Input.isDown('skill')) {
          rolling = true;
          leader.setState(STATE.CUSTOM, { sprite: 'choe_pushing_rock' });
        } else if (!Input.isDown('skill') && rolling) {
          rolling = false;
          if (leader.customSpriteKey === 'choe_pushing_rock') leader.setState(STATE.IDLE);
        }
      }
      if (rolling) {
        const dir = Math.sign(this.x - (scene.characters['choe']?.x || this.x - 1));
        this.x += dir * CONFIG.WALK_SPEED * dt;
      }
      // Trigger
      if (triggerX && !done && rolling && this.x >= triggerX) {
        done = true; rolling = false;
        scene._fireEvent(triggerEvent);
        const c = scene.characters['choe'];
        if (c && c.customSpriteKey === 'choe_pushing_rock') c.setState(STATE.IDLE);
      }
    },
    draw(ctx) {
      const cx = this.x, cy = this.y - H / 2;
      ctx.save();
      ctx.fillStyle = '#9a8a78';
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(cx, cy, W/2, H/2, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx-25, cy-8); ctx.lineTo(cx+8, cy+22);
      ctx.moveTo(cx+18, cy-22); ctx.lineTo(cx-5, cy+12);
      ctx.stroke();
      if (rolling) {
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath(); ctx.ellipse(cx, this.y+6, W/2+12, 14, 0, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }
  };
  return obj;
}

function createButterfly({ id, from, to, duration = 5000, color = '#4a9fd4' }) {
  const start = performance.now();
  return {
    id: id || `p${_propIdCounter++}`,
    x: from[0], y: from[1],
    update(dt) {
      const p = Math.min(1, (performance.now() - start) / duration);
      // Bezier-like flight with sine wobble
      this.x = from[0] + (to[0] - from[0]) * p;
      this.y = from[1] + (to[1] - from[1]) * p + Math.sin(p * Math.PI * 6) * 40;
    },
    draw(ctx) {
      const flap = Math.sin(performance.now() / 60) * 0.6 + 0.5; // 0..1
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      // Left wing
      ctx.save();
      ctx.scale(flap * 0.6 + 0.4, 1);
      ctx.beginPath(); ctx.ellipse(-9, 0, 11, 14, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // Right wing
      ctx.save();
      ctx.scale(-(flap * 0.6 + 0.4), 1);
      ctx.beginPath(); ctx.ellipse(-9, 0, 11, 14, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // Body
      ctx.fillStyle = '#2a1a2e';
      ctx.fillRect(-1.5, -6, 3, 12);
      ctx.restore();
    }
  };
}
