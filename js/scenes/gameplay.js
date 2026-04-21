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
    this.rightBarrier = null;   // optional x cap — blocks leader from crossing (e.g. unbuilt bridge)

    // Input lock (cutscenes, forced movement)
    this.inputLocked = false;
    this.charSwitchLocked = false;

    // Cave walk mode
    this.caveWalkMode = false;

    // Visual overlays
    this.vignetteAlpha = 0;
    this._vignetteTarget = undefined;
    this._vignetteSpeed = 0.5;

    // Background override (null = use chapter default)
    this.currentBgKey = null;

    // Heartbeat synthesizer
    this._heartbeatActive = false;
    this._heartbeatTimer = null;
    this._heartbeatBpm = 60;

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

    // Reset engine state
    this.charSwitchLocked = false;
    this.caveWalkMode = false;
    this.vignetteAlpha = 0;
    this._vignetteTarget = undefined;
    this.currentBgKey = null;
    this._lockedFollowers = new Set();
    this._stopHeartbeat();

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
    this._stopHeartbeat();
  }

  update(dt) {
    // Inline script always advances (regardless of dialog/cutscene mode),
    // so scripted moves + say commands can flow naturally together.
    this._updateInlineScript(dt);

    // Vignette animation runs unconditionally so fades work during dialog/cutscene
    if (this._vignetteTarget !== undefined) {
      const diff = this._vignetteTarget - this.vignetteAlpha;
      if (Math.abs(diff) < 0.005) {
        this.vignetteAlpha = this._vignetteTarget;
        this._vignetteTarget = undefined;
      } else {
        this.vignetteAlpha += Math.sign(diff) * (this._vignetteSpeed || 0.5) * dt;
      }
    }

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

    // Cave walk mode — all 3 walk together, hold SPACE to advance
    if (this.caveWalkMode) {
      this._updateCaveWalk(dt);
      return;
    }

    // Character switching
    if (!this.inputLocked && !this.charSwitchLocked) {
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

    // Clamp leader in world — 130px margin left (never flush with edge),
    // 50px margin right so chapter-ending triggers near worldWidth can be reached.
    // rightBarrier (if set) blocks crossing until puzzle is solved (e.g. unbuilt bridge).
    const _rightMax = this.rightBarrier !== null
      ? this.rightBarrier
      : this.chapter.worldWidth - 50;
    leader.x = Math.max(130, Math.min(_rightMax, leader.x));

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
      if (!follower._scriptedMove && !this.charAttachments[id] && !this._lockedFollowers?.has(id)) {
        follower.followUpdate(leader, offset, dt, platforms);
      }
      offset += -offsetSign * CONFIG.FOLLOW_DISTANCE * 0.55;
    }

    // Attached chars (hand-holding OR piggyback): snap child beside/above parent
    for (const [childId, attachment] of Object.entries(this.charAttachments)) {
      const child = this.characters[childId];
      const parentId = typeof attachment === 'string' ? attachment : attachment.parent;
      const yOffset  = typeof attachment === 'object' ? (attachment.yOffset || 0) : 0;
      const parent = this.characters[parentId];
      if (!child || !parent) continue;
      const xOff = yOffset !== 0 ? 0 : parent.facing * -80; // piggyback: center on parent
      const targetX = parent.x + xOff;
      child.x += (targetX - child.x) * Math.min(1, dt * 12);
      child.y = parent.y + yOffset;
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
        else if (!forceEnterOnly && leader.x >= t.x && leader.x <= (t.x + (t.w || 80))) {
          // Guard: skip positional triggers while the intro script is running with input locked.
          // Prevents a character teleported into a trigger zone from firing that trigger mid-intro.
          if (this.inputLocked && this.scriptRunning && t.x > 0) continue;
          fire = true;
        }
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
        if (c) {
          c.setState(STATE.CUSTOM, { sprite: cmd.sprite });
          // Optional scale override per-pose (corrects sprites where character
          // occupies smaller proportion of the frame, e.g. arm_around_shoulder)
          if (cmd.scale !== undefined) c.scale = cmd.scale;
        }
        break;
      }
      case 'charScale': {
        const c = this.characters[cmd.char];
        if (c) c.scale = cmd.scale ?? 1.0;
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
      case 'narrate': {
        const _isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
        const _txt = (_isTouch && cmd.mobileText) ? cmd.mobileText : cmd.text;
        this.dialog.narrate(_txt, { duration: cmd.duration, waitForInput: cmd.waitForInput !== false, tutorial: cmd.tutorial });
        break;
      }
      case 'bgm':
        this.game.audio.playBgm(`audio/${cmd.track}.mp3`, { fadeMs: cmd.fadeMs || 1500 });
        break;
      case 'stopBgm':
        // Fade out current BGM without starting a new one
        this.game.audio.playBgm('', { fadeMs: cmd.fadeMs || 2000 });
        break;
      case 'sfx':
        this.game.audio.playSfx(`audio/${cmd.sfx}.mp3`);
        break;
      case 'voice':
        // Plays through voiceGain — for spoken recordings
        this.game.audio.playVoice(`audio/${cmd.sfx}.mp3`);
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
      case 'setRightBarrier':
        // Prevent leader from crossing x until clearRightBarrier is called
        this.rightBarrier = cmd.x;
        break;
      case 'clearRightBarrier':
        this.rightBarrier = null;
        break;
      case 'deflectProp': {
        const p = this.props.find(p => p.id === cmd.id);
        if (p && typeof p.deflect === 'function') p.deflect();
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
      case 'gameComplete':
        this.chapterComplete = true;
        setTimeout(() => this.game.showDemoEnd(), cmd.delay || 300);
        break;
      case 'goToCredits':
        this.chapterComplete = true;
        setTimeout(() => this.game.showCredits(), cmd.delay || 300);
        break;
      case 'lockCharSwitch':
        this.charSwitchLocked = true;
        break;
      case 'unlockCharSwitch':
        this.charSwitchLocked = false;
        break;
      case 'hideChar': {
        const c = this.characters[cmd.char];
        if (c) c.visible = false;
        break;
      }
      case 'showChar': {
        const c = this.characters[cmd.char];
        if (c) c.visible = true;
        break;
      }
      case 'lockFollower':
        if (!this._lockedFollowers) this._lockedFollowers = new Set();
        this._lockedFollowers.add(cmd.char);
        if (this.characters[cmd.char]) this.characters[cmd.char].vx = 0;
        break;
      case 'unlockFollower':
        if (this._lockedFollowers) this._lockedFollowers.delete(cmd.char);
        break;
      case 'setBg':
        this.currentBgKey = cmd.key || null;
        break;
      case 'setVignette':
        this.vignetteAlpha = cmd.alpha ?? 0;
        this._vignetteTarget = undefined;
        break;
      case 'animateVignette':
        this._vignetteTarget = cmd.to ?? 0;
        this._vignetteSpeed = cmd.speed ?? 0.5;
        break;
      case 'setCaveWalk':
        this.caveWalkMode = !!cmd.on;
        if (!cmd.on) {
          // Restore normal idle when exiting cave walk
          for (const id of CONFIG.CHARACTER_IDS) {
            const c = this.characters[id];
            if (c) { c.vx = 0; c.setState(STATE.IDLE); }
          }
        }
        break;
      case 'piggybackAttach':
        this.charAttachments[cmd.child] = { parent: cmd.parent, yOffset: cmd.yOffset ?? -90 };
        break;
      case 'piggybackDetach':
        delete this.charAttachments[cmd.child];
        break;
      case 'heartbeat':
        this._startHeartbeat(cmd.bpm || 60);
        break;
      case 'stopHeartbeat':
        this._stopHeartbeat();
        break;
      case 'setHeartbeatBpm':
        this._heartbeatBpm = cmd.bpm || 60;
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

    // Vignette overlay (progressive darkness: cave, night, etc.)
    if (this.vignetteAlpha > 0.001) {
      const va = Math.min(1, this.vignetteAlpha);
      const grd = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.12, W / 2, H * 0.5, H * 0.88);
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(0.55, `rgba(0,0,0,${va * 0.35})`);
      grd.addColorStop(1, `rgba(0,0,0,${va})`);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }

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
    const bg = this.game.assets.get(this.currentBgKey || this.chapter.background);
    if (!bg) {
      ctx.fillStyle = '#556b4e';
      ctx.fillRect(0, 0, CONFIG.LOGICAL_WIDTH, CONFIG.LOGICAL_HEIGHT);
      return;
    }
    // Cover-fit: each chapter background fills the screen exactly, no tiling, no parallax.
    // Backgrounds are chapter-specific and self-contained within their scene.
    const W = CONFIG.LOGICAL_WIDTH, H = CONFIG.LOGICAL_HEIGHT;
    const scale = Math.max(W / bg.width, H / bg.height);
    const bw = bg.width * scale;
    const bh = bg.height * scale;
    ctx.drawImage(bg, (W - bw) / 2, (H - bh) / 2, bw, bh);
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
        // Preserve CUSTOM pose (charPose) — only reset to idle if no custom sprite
        if (c.state !== STATE.CUSTOM) c.setState(STATE.IDLE);
        if (onDone) { try { onDone(); } catch(e) { console.error(e); } }
        continue;
      }
      const dir = Math.sign(dx);
      c.vx = dir * sm.speed;
      c.facing = dir;
      // Drive horizontal motion ourselves; let updateBody handle gravity/ground.
      const platforms = this._getActivePlatforms();
      updateBody(c, platforms, CONFIG.GROUND_Y, dt);
      // Preserve CUSTOM pose during movement (e.g. cucu_diving_save while charging in)
      if (c.state !== STATE.CUSTOM) {
        if (sm.speed >= CONFIG.RUN_SPEED) c.setState(STATE.RUN);
        else c.setState(STATE.WALK);
      }
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
      // Chevron arrow — tip points in the direction of movement
      const dir = b.action === 'left' ? -1 : 1;
      const s = rr * 0.38;
      ctx.beginPath();
      ctx.moveTo(cx - dir * s * 0.4, cy - s);   // top wing (opposite side)
      ctx.lineTo(cx + dir * s * 0.4, cy);         // apex tip (direction of motion)
      ctx.lineTo(cx - dir * s * 0.4, cy + s);   // bottom wing
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
      const cx = px + portraitSize / 2, cy = py + portraitSize / 2, r = portraitSize / 2;
      const active = id === this.leaderId;
      ctx.save();

      // Active glow ring behind portrait
      if (active) {
        ctx.beginPath();
        ctx.arc(cx, cy, r + 7, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(212,165,116,0.45)';
        ctx.lineWidth = 9;
        ctx.stroke();
      }

      // Background fill
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#2a1e14' : 'rgba(10,12,9,0.8)';
      ctx.fill();

      // Sprite thumbnail — clip to circle, show head/upper body
      const img = this.game.assets.get(`${id}_idle_side`);
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
        ctx.clip();
        const spriteH = portraitSize * 2.4;
        const spriteW = img.width * (spriteH / img.height);
        ctx.globalAlpha = active ? 1 : 0.65;
        ctx.drawImage(img, cx - spriteW / 2, py, spriteW, spriteH);
        ctx.restore();
      } else {
        // Fallback: color dot
        ctx.fillStyle = CONFIG.CHARACTER_COLORS[id];
        ctx.beginPath();
        ctx.arc(cx, cy, r - 14, 0, Math.PI * 2);
        ctx.fill();
      }

      // Border ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = active ? '#d4a574' : 'rgba(245,234,208,0.35)';
      ctx.lineWidth = active ? 3.5 : 2;
      ctx.stroke();

      // Key-number badge (bottom-right corner of portrait)
      const badgeR = 13;
      const badgeX = px + portraitSize - badgeR + 2, badgeY = py + portraitSize - badgeR + 2;
      ctx.fillStyle = active ? '#d4a574' : 'rgba(40,32,22,0.85)';
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = active ? '#2a1e14' : 'rgba(245,234,208,0.7)';
      ctx.font = '700 16px "Be Vietnam Pro"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), badgeX, badgeY);

      // Name below
      ctx.fillStyle = active ? '#f5ead0' : 'rgba(245,234,208,0.5)';
      ctx.font = active ? '600 15px "Be Vietnam Pro"' : '400 14px "Be Vietnam Pro"';
      ctx.textBaseline = 'top';
      ctx.fillText(CONFIG.CHARACTER_NAMES[id], cx, py + portraitSize + 5);
      ctx.restore();
    }

    // Flower collectibles counter top-left — drawn flower, no emoji
    if (this.totalCollectibles > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(20,22,18,0.72)';
      this._roundRect(ctx, 30, 30, 190, 54, 10);
      ctx.fill();
      // Draw a simple flower glyph instead of emoji (more reliable cross-platform)
      const fx = 62, fy = 57;
      ctx.fillStyle = '#e8a0c0';
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(fx + Math.cos(a) * 8, fy + Math.sin(a) * 8, 6, 4, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f5e060';
      ctx.beginPath();
      ctx.arc(fx, fy, 6, 0, Math.PI * 2);
      ctx.fill();
      // Count text
      ctx.fillStyle = '#f5ead0';
      ctx.font = '600 28px "Be Vietnam Pro"';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${this.collectedCount} / ${this.totalCollectibles}`, 82, 57);
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

  // ---- Cave Walk ------------------------------------------------

  _updateCaveWalk(dt) {
    const walking = Input.isDown('jump') || Input.isDown('skill');
    const speed = walking ? CONFIG.WALK_SPEED * 0.42 : 0;
    const platforms = this._getActivePlatforms();

    const choe  = this.characters['choe'];
    const cucu  = this.characters['cucu'];
    const chien = this.characters['chien'];

    if (choe) {
      choe.vx = speed;
      choe.facing = 1;
      updateBody(choe, platforms, CONFIG.GROUND_Y, dt);
      choe.x = Math.max(50, Math.min(this.chapter.worldWidth - 50, choe.x));
      if (walking) choe.setState(STATE.WALK); else choe.setState(STATE.IDLE);
    }
    // Keep cucu & chien flanking choe
    if (cucu && choe) {
      const tx = choe.x - 90;
      cucu.x += (tx - cucu.x) * Math.min(1, dt * 7);
      cucu.y = CONFIG.GROUND_Y;
      cucu.facing = 1;
      if (walking) cucu.setState(STATE.WALK); else cucu.setState(STATE.IDLE);
    }
    if (chien && choe) {
      const tx = choe.x + 90;
      chien.x += (tx - chien.x) * Math.min(1, dt * 7);
      chien.y = CONFIG.GROUND_Y;
      chien.facing = 1;
      if (walking) chien.setState(STATE.WALK); else chien.setState(STATE.IDLE);
    }

    // Camera follows choe
    const leader = choe || this.characters[this.leaderId];
    if (leader) {
      const dz = CAMERA.DEADZONE_X * 0.5;
      const targetCx = leader.x + 60;
      const screenCx = this.cameraX + CONFIG.LOGICAL_WIDTH / 2;
      if (targetCx > screenCx + dz) this.cameraTargetX = targetCx - dz - CONFIG.LOGICAL_WIDTH / 2;
      this.cameraTargetX = Math.max(0, Math.min(this.chapter.worldWidth - CONFIG.LOGICAL_WIDTH, this.cameraTargetX));
      this.cameraX += (this.cameraTargetX - this.cameraX) * CAMERA.LERP;
    }

    if (this.cameraShake > 0) this.cameraShake = Math.max(0, this.cameraShake - dt * 20);
    for (const p of this.props) if (p.update) p.update(dt);
    this._checkTriggers(false);
    this.dialog.update(dt);
    // Note: _updateInlineScript is already called at the top of update()
  }

  // ---- Heartbeat synthesizer ------------------------------------

  _startHeartbeat(bpm) {
    this._stopHeartbeat();
    this._heartbeatActive = true;
    this._heartbeatBpm = bpm;
    this._scheduleNextBeat();
  }

  _scheduleNextBeat() {
    if (!this._heartbeatActive) return;
    const interval = 60000 / (this._heartbeatBpm || 60);
    this._heartbeatTimer = setTimeout(() => {
      this._playBeatSound();
      this._scheduleNextBeat();
    }, interval);
  }

  _playBeatSound() {
    const audio = this.game.audio;
    const ctx = audio._ctx || audio.ctx;
    if (!ctx || ctx.state !== 'running') return;
    try {
      const now = ctx.currentTime;
      const g1 = ctx.createGain();
      g1.connect(ctx.destination);
      const o1 = ctx.createOscillator();
      o1.frequency.value = 78; o1.type = 'sine';
      o1.connect(g1);
      g1.gain.setValueAtTime(0, now);
      g1.gain.linearRampToValueAtTime(0.28, now + 0.018);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      o1.start(now); o1.stop(now + 0.32);

      const g2 = ctx.createGain();
      g2.connect(ctx.destination);
      const o2 = ctx.createOscillator();
      o2.frequency.value = 63; o2.type = 'sine';
      o2.connect(g2);
      g2.gain.setValueAtTime(0, now + 0.13);
      g2.gain.linearRampToValueAtTime(0.20, now + 0.148);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      o2.start(now + 0.13); o2.stop(now + 0.48);
    } catch(e) {}
  }

  _stopHeartbeat() {
    this._heartbeatActive = false;
    if (this._heartbeatTimer) { clearTimeout(this._heartbeatTimer); this._heartbeatTimer = null; }
  }
}

// ---------- Props ----------

let _propIdCounter = 0;

function createProp(cmd, scene) {
  if (cmd.prop === 'butterfly') return createButterfly(cmd);
  if (cmd.prop === 'boulder')   return createBoulder(cmd, scene);
  if (cmd.prop === 'campfire')  return createCampfire(cmd);
  if (cmd.prop === 'fallingBranch') return createFallingBranch(cmd, scene);
  if (cmd.prop === 'deerEyes')  return createDeerEyes(cmd, scene);
  if (cmd.prop === 'fireflies') return createFireflies(cmd);
  return { id: `p${_propIdCounter++}`, update: () => {}, draw: () => {} };
}

function createBoulder({ id, x, y, triggerX, triggerEvent, sinkDepth = 0 }, scene) {
  // sinkDepth: how far below groundY the stone sits once pushed in (0 = on ground)
  let vy = 0, rolling = false, done = false, splashing = false, splashTimer = 0;
  // Each boulder gets a unique seed for irregular shape
  const seed = (id || '').charCodeAt(id?.length - 1 || 0) * 137 || Math.random() * 999 | 0;
  const rng = (n) => { let s = (seed * 9301 + n * 49297) % 233280; return s / 233280; };
  // Pre-generate 8 polygon points for irregular stone outline
  const NUM_PTS = 9;
  const stoneVerts = Array.from({ length: NUM_PTS }, (_, i) => {
    const angle = (i / NUM_PTS) * Math.PI * 2 - Math.PI / 2;
    const r = 0.78 + rng(i * 3) * 0.22;          // radius variation ±22%
    const wobble = (rng(i * 7 + 1) - 0.5) * 0.18; // angular wobble
    return { a: angle + wobble, r };
  });
  const W = 110 + (seed % 3) * 14;  // stones have slightly different sizes
  const H = W * (0.72 + rng(5) * 0.16);

  const obj = {
    id: id || `boulder${_propIdCounter++}`,
    x, y: y ?? CONFIG.GROUND_Y,
    sinkY: CONFIG.GROUND_Y + sinkDepth,
    update(dt) {
      if (done && !splashing) return;
      if (splashing) {
        splashTimer += dt;
        if (splashTimer > 0.55) splashing = false;
        return;
      }
      // Gravity
      vy += 1200 * dt;
      this.y = Math.min(CONFIG.GROUND_Y, this.y + vy * dt);
      if (this.y >= CONFIG.GROUND_Y) vy = 0;

      // Skill push: only Chòe as leader, adjacent, holding skill key
      const leader = scene.characters[scene.leaderId];
      if (!scene.inputLocked && scene.leaderId === 'choe' && leader) {
        const dx = this.x - leader.x;
        const near = Math.abs(dx) < 130 && Math.abs(this.y - leader.y) < 80;
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
        this.x += CONFIG.WALK_SPEED * dt;
      }
      // Trigger: stone reaches stream edge → splash + sink
      if (triggerX && !done && rolling && this.x >= triggerX) {
        done = true; rolling = false; splashing = true; splashTimer = 0;
        scene._fireEvent(triggerEvent);
        // Sink into stream
        this.y = this.sinkY;
        const c = scene.characters['choe'];
        if (c && c.customSpriteKey === 'choe_pushing_rock') c.setState(STATE.IDLE);
      }
    },
    draw(ctx) {
      if (!splashing && done && sinkDepth === 0) {
        // Fully submerged — draw as stepping-stone peeking out of water
        this._drawStone(ctx, this.x, this.y - H * 0.18, W * 1.1, H * 0.36, true);
        return;
      }
      if (splashing) {
        this._drawSplash(ctx, this.x, CONFIG.GROUND_Y, splashTimer);
      }
      if (!done) {
        // Ground shadow
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 6, W * 0.55, H * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        this._drawStone(ctx, this.x, this.y - H * 0.5, W, H, false);
      }
    },
    _drawStone(ctx, cx, cy, sw, sh, isWet) {
      ctx.save();
      // Main stone body — radial gradient for depth
      const grad = ctx.createRadialGradient(cx - sw * 0.2, cy - sh * 0.25, sw * 0.08, cx, cy, sw * 0.7);
      if (isWet) {
        grad.addColorStop(0, '#8a9e90');
        grad.addColorStop(0.5, '#5c7060');
        grad.addColorStop(1, '#3a4d3c');
      } else {
        grad.addColorStop(0, '#b8a898');
        grad.addColorStop(0.45, '#8a7a6a');
        grad.addColorStop(1, '#4a3a2e');
      }
      ctx.fillStyle = grad;
      // Irregular polygon path
      ctx.beginPath();
      for (let i = 0; i < NUM_PTS; i++) {
        const v = stoneVerts[i];
        const px = cx + Math.cos(v.a) * sw * v.r * 0.5;
        const py = cy + Math.sin(v.a) * sh * v.r * 0.5;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Rim / outline
      ctx.strokeStyle = isWet ? 'rgba(20,40,22,0.55)' : 'rgba(30,20,12,0.5)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Surface cracks
      ctx.strokeStyle = isWet ? 'rgba(10,30,12,0.35)' : 'rgba(20,14,8,0.28)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - sw*0.18, cy - sh*0.05); ctx.lineTo(cx + sw*0.12, cy + sh*0.18);
      ctx.moveTo(cx + sw*0.15, cy - sh*0.22); ctx.lineTo(cx - sw*0.06, cy + sh*0.10);
      ctx.stroke();

      // Highlight (top-left specular)
      ctx.fillStyle = 'rgba(255,255,240,0.18)';
      ctx.beginPath();
      ctx.ellipse(cx - sw*0.15, cy - sh*0.22, sw*0.15, sh*0.10, -0.4, 0, Math.PI*2);
      ctx.fill();

      // Moss patch (bottom-right, only on dry stones)
      if (!isWet) {
        ctx.fillStyle = 'rgba(60,90,40,0.22)';
        ctx.beginPath();
        ctx.ellipse(cx + sw*0.18, cy + sh*0.18, sw*0.16, sh*0.10, 0.3, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    },
    _drawSplash(ctx, sx, sy, t) {
      ctx.save();
      const progress = Math.min(1, t / 0.55);
      const spread = progress * 80;
      const alpha = (1 - progress) * 0.75;
      // Water spray droplets
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r = spread * (0.5 + 0.5 * ((i * 3 + seed) % 5) / 4);
        const drop = {
          x: sx + Math.cos(a) * r,
          y: sy - Math.sin(Math.abs(a)) * spread * 0.7 * progress,
        };
        ctx.fillStyle = `rgba(130,190,220,${alpha * 0.8})`;
        ctx.beginPath();
        ctx.ellipse(drop.x, drop.y, 4, 7, a, 0, Math.PI * 2);
        ctx.fill();
      }
      // Ripple ring
      ctx.strokeStyle = `rgba(100,160,200,${alpha * 0.6})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(sx, sy, spread * 0.9, spread * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    },
  };
  return obj;
}

function createFallingBranch({ id, x }, scene) {
  const bx = x || 1350;
  let phase = 'falling'; // 'falling' | 'deflected' | 'gone'
  let by = -120;
  let vy = 60;
  let angle = -0.35;
  let dvx = 0, dvy = 0, doneT = 0;

  // Pre-generate leaf angles (not random per frame)
  const leafAngles = [0.2, -0.3, 0.5, -0.1, 0.4];

  return {
    id: id || `branch${_propIdCounter++}`,
    x: bx, y: by,
    deflect() {
      if (phase !== 'falling') return;
      phase = 'deflected';
      dvx = 420; dvy = -240;
    },
    update(dt) {
      if (phase === 'falling') {
        vy += 680 * dt;
        by += vy * dt;
        this.y = by;
        angle += dt * 0.25;
        if (by >= CONFIG.GROUND_Y - 150 && phase === 'falling') {
          phase = 'deflected'; dvx = 380; dvy = -200;
        }
      } else if (phase === 'deflected') {
        dvy += 600 * dt;
        this.x += dvx * dt;
        this.y += dvy * dt;
        angle -= dt * 2.5;
        doneT += dt;
        if (doneT > 0.9) phase = 'gone';
      }
    },
    draw(ctx) {
      if (phase === 'gone') return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);

      // Shadow on ground (only while falling)
      if (phase === 'falling') {
        const shadowAlpha = Math.max(0, 0.25 - (by / CONFIG.GROUND_Y) * 0.1);
        ctx.save();
        ctx.globalAlpha = shadowAlpha;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(0, CONFIG.GROUND_Y - this.y, 60, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Leaf clusters
      const clusters = [
        { ox: 0,   oy: -280, rx: 52, ry: 36, col: '#4a9045' },
        { ox: -55, oy: -210, rx: 40, ry: 28, col: '#3a7a38' },
        { ox:  48, oy: -200, rx: 36, ry: 26, col: '#5aaa50' },
        { ox: -28, oy: -140, rx: 30, ry: 22, col: '#357030' },
        { ox:  30, oy: -130, rx: 28, ry: 20, col: '#4a8842' },
      ];
      clusters.forEach((lc, i) => {
        ctx.save();
        ctx.globalAlpha = 0.90;
        const g = ctx.createRadialGradient(lc.ox, lc.oy, 0, lc.ox, lc.oy, lc.rx);
        g.addColorStop(0, '#7ec87a');
        g.addColorStop(0.6, lc.col);
        g.addColorStop(1, 'rgba(20,50,20,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(lc.ox, lc.oy, lc.rx, lc.ry, leafAngles[i], 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Main trunk
      ctx.lineCap = 'round';
      const trunk = [[0, 0, 0, -300, 18], [-50, -200, -90, -270, 11], [42, -180, 75, -260, 9]];
      for (const [x1, y1, x2, y2, lw] of trunk) {
        ctx.strokeStyle = '#7a5230';
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        // Highlight
        ctx.strokeStyle = 'rgba(210,160,90,0.35)';
        ctx.lineWidth = lw * 0.28;
        ctx.beginPath();
        ctx.moveTo(x1 - lw * 0.18, y1);
        ctx.lineTo(x2 - lw * 0.18, y2);
        ctx.stroke();
      }

      ctx.restore();
    },
  };
}

function createCampfire({ id, x, y }) {
  return {
    id: id || `p${_propIdCounter++}`,
    x: x || 760, y: y || CONFIG.GROUND_Y,
    update() {},
    draw(ctx) {
      const cx = this.x, cy = this.y;
      const t = performance.now() / 1000;
      ctx.save();
      // Log
      ctx.fillStyle = '#4a2e10';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 6, 48, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      // Flame layers (outer → inner)
      const layers = [
        { r: 32, h: 72, col1: 'rgba(255,90,10,', col2: 'rgba(255,0,0,0)' },
        { r: 24, h: 55, col1: 'rgba(255,160,30,', col2: 'rgba(255,60,0,0)' },
        { r: 14, h: 38, col1: 'rgba(255,230,80,', col2: 'rgba(255,200,0,0)' },
      ];
      for (let li = 0; li < layers.length; li++) {
        const l = layers[li];
        const flicker = Math.sin(t * 7 + li * 1.8) * 0.12 + 0.88;
        const hw = (l.r * flicker) | 0;
        const hh = (l.h * flicker) | 0;
        const alpha = 0.82 - li * 0.18;
        const grd = ctx.createRadialGradient(cx, cy - hh * 0.55, 2, cx, cy - hh * 0.3, hw * 1.2);
        grd.addColorStop(0, l.col1 + alpha + ')');
        grd.addColorStop(1, l.col2);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.ellipse(cx + Math.sin(t * 3 + li) * 3, cy - hh * 0.5, hw, hh * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // Embers
      for (let i = 0; i < 7; i++) {
        const et = ((t * 0.65 + i * 0.43) % 1);
        const ex = cx + Math.sin(t * 1.2 + i * 2.3) * 18;
        const ey = cy - 15 - et * 100;
        const ea = Math.max(0, 1 - et * 1.4);
        ctx.fillStyle = `rgba(255,180,50,${ea})`;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.2 * (1 - et * 0.8), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },
  };
}

function createDeerEyes({ id, x, y }, scene) {
  // Eyes start far away and slowly drift toward the player — no button press needed
  let blinkTimer = 0, blinking = false;
  const startX = x || 2600;
  return {
    id: id || `p${_propIdCounter++}`,
    x: startX, y: y || CONFIG.GROUND_Y - 120,
    _moveSpeed: 55,   // px/s — clearly visible approach from darkness
    update(dt) {
      // Drift LEFT at constant speed, stop when within 280px of player
      const leader = scene?.characters?.[scene?.leaderId];
      const minDist = 280;
      if (!leader || this.x > leader.x + minDist) {
        this.x -= this._moveSpeed * dt;
      }
      blinkTimer += dt;
      if (!blinking && blinkTimer > 2.2) { blinking = true; blinkTimer = 0; }
      if (blinking && blinkTimer > 0.14) { blinking = false; blinkTimer = 0; }
    },
    draw(ctx) {
      if (blinking) return;
      const spacing = 50, r = 13;
      for (let i = 0; i < 2; i++) {
        const ex = this.x + (i === 0 ? -spacing / 2 : spacing / 2);
        const ey = this.y;
        // Outer ambient glow
        const grd2 = ctx.createRadialGradient(ex, ey, 0, ex, ey, r * 5);
        grd2.addColorStop(0, 'rgba(255,40,10,0.4)');
        grd2.addColorStop(1, 'rgba(150,0,0,0)');
        ctx.fillStyle = grd2;
        ctx.beginPath();
        ctx.arc(ex, ey, r * 5, 0, Math.PI * 2);
        ctx.fill();
        // Inner hot glow
        const grd = ctx.createRadialGradient(ex, ey, 0, ex, ey, r * 2.4);
        grd.addColorStop(0, 'rgba(255,200,160,1)');
        grd.addColorStop(0.3, 'rgba(255,60,20,0.95)');
        grd.addColorStop(1, 'rgba(180,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(ex, ey, r * 2.4, 0, Math.PI * 2);
        ctx.fill();
        // Pupil
        ctx.fillStyle = '#cc1100';
        ctx.beginPath();
        ctx.ellipse(ex, ey, r, r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Specular
        ctx.fillStyle = 'rgba(255,255,200,0.6)';
        ctx.beginPath();
        ctx.ellipse(ex - r*0.3, ey - r*0.25, r*0.25, r*0.15, 0, 0, Math.PI*2);
        ctx.fill();
      }
    },
  };
}

function createFireflies({ id, count = 35 }) {
  const flies = Array.from({ length: count }, (_, i) => ({
    wx: 2800 + Math.random() * 1200,
    wy: CONFIG.GROUND_Y - 80 - Math.random() * 380,
    phase: Math.random() * Math.PI * 2,
    speed: 18 + Math.random() * 28,
    dir: Math.random() * Math.PI * 2,
  }));
  return {
    id: id || `p${_propIdCounter++}`,
    update(dt) {
      for (const f of flies) {
        f.phase += dt * 1.8;
        f.wx += Math.cos(f.dir) * f.speed * dt;
        f.wy += Math.sin(f.dir) * f.speed * dt * 0.25;
        f.wy = Math.max(CONFIG.GROUND_Y - 480, Math.min(CONFIG.GROUND_Y - 60, f.wy));
        if (Math.random() < 0.008) f.dir += (Math.random() - 0.5) * 0.6;
      }
    },
    draw(ctx) {
      for (const f of flies) {
        const a = (Math.sin(f.phase) * 0.42 + 0.58);
        const grd = ctx.createRadialGradient(f.wx, f.wy, 0, f.wx, f.wy, 11);
        grd.addColorStop(0, `rgba(190,255,80,${a})`);
        grd.addColorStop(1, 'rgba(180,255,50,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(f.wx, f.wy, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(240,255,180,${a * 0.9})`;
        ctx.beginPath();
        ctx.arc(f.wx, f.wy, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  };
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
