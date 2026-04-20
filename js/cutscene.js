// Three Little Wings — Cutscene system

import { CONFIG } from './config.js';

/**
 * Executes a timeline: an array of { t, cmd, ... } commands sorted by t (ms).
 * Runs "interpreter" style: each frame, fire all commands whose time has passed.
 * Some commands are instantaneous; others set persistent state (fades, Ken Burns).
 *
 * Supported cmds:
 *   { t, cmd:'scene', asset, kenBurns:{from, to, pan:[x,y], duration} }
 *   { t, cmd:'crossfade', to:assetKey, duration }
 *   { t, cmd:'kenBurns', from, to, pan, duration }
 *   { t, cmd:'fadeToBlack', duration }
 *   { t, cmd:'fadeFromBlack', duration }
 *   { t, cmd:'say', char, text, duration? }
 *   { t, cmd:'narrate', text, duration? }
 *   { t, cmd:'bgm', track, fadeMs? }
 *   { t, cmd:'sfx', url }
 *   { t, cmd:'wait', duration }    // no-op, just occupies time
 *   { t, cmd:'callback', fn }      // arbitrary js
 *   { t, cmd:'end' }               // early termination
 */

export class SceneCutscenePlayer {
  constructor({ assets, dialog, audio, inputRef }) {
    this.assets = assets;
    this.dialog = dialog;
    this.audio = audio;
    this.input = inputRef;
    this.active = false;
    this.timeline = null;
    this.startTime = 0;
    this.cursor = 0;        // next timeline event index to fire
    this.resolvePromise = null;

    // Persistent visual state
    this.currentSceneKey = null;
    this.nextSceneKey = null;  // during crossfade
    this.crossfadeStart = 0;
    this.crossfadeDuration = 0;
    this.kenBurns = { from: 1.0, to: 1.0, pan: [0,0], start: 0, duration: 0 };

    this.fadeBlackAlpha = 0;
    this.fadeAnim = null;  // { from, to, start, duration }

    this.skippable = true;
  }

  play(timeline, opts = {}) {
    this.timeline = [...timeline].sort((a,b) => a.t - b.t);
    this.cursor = 0;
    this.startTime = performance.now();
    this.active = true;
    this.skippable = opts.skippable !== false;
    this.currentSceneKey = null;
    this.nextSceneKey = null;
    this.crossfadeStart = 0;
    this.fadeBlackAlpha = opts.startBlack ? 1 : 0;
    this.fadeAnim = null;
    this.kenBurns = { from: 1.0, to: 1.0, pan: [0,0], start: 0, duration: 0 };

    return new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  stop() {
    if (!this.active) return;
    this.active = false;
    this.dialog.clear();
    if (this.resolvePromise) { this.resolvePromise(); this.resolvePromise = null; }
  }

  update(dt) {
    if (!this.active) return;
    const now = performance.now();
    const elapsed = now - this.startTime;

    // Fire pending commands
    while (this.cursor < this.timeline.length && this.timeline[this.cursor].t <= elapsed) {
      const cmd = this.timeline[this.cursor++];
      this._exec(cmd);
    }

    // Commit crossfade when the fade completes (frame-driven, not setTimeout)
    if (this.nextSceneKey) {
      const fp = (now - this.crossfadeStart) / this.crossfadeDuration;
      if (fp >= 1) {
        this.currentSceneKey = this.nextSceneKey;
        this.nextSceneKey = null;
      }
    }

    // Update fade animation
    if (this.fadeAnim) {
      const p = Math.min(1, (now - this.fadeAnim.start) / this.fadeAnim.duration);
      this.fadeBlackAlpha = this.fadeAnim.from + (this.fadeAnim.to - this.fadeAnim.from) * p;
      if (p >= 1) this.fadeAnim = null;
    }

    // Check if Ken Burns is still animating
    const kbActive = this.kenBurns.duration > 0 &&
      (now - this.kenBurns.start) < this.kenBurns.duration;

    // Auto-end ONLY when: timeline consumed, no dialog, no fade, no crossfade,
    // and no Ken Burns motion still going. This protects the closing shot.
    const allDone = this.cursor >= this.timeline.length &&
                    !this.dialog.isActive() &&
                    this.fadeAnim === null &&
                    this.nextSceneKey === null &&
                    !kbActive;
    if (allDone) {
      if (!this._endGrace) this._endGrace = now;
      if (now - this._endGrace > 200) {
        this._endGrace = 0;
        this.stop();
      }
    } else {
      this._endGrace = 0;
    }
  }

  _exec(cmd) {
    switch (cmd.cmd) {
      case 'scene':
        this.currentSceneKey = cmd.asset;
        if (cmd.kenBurns) {
          this.kenBurns = {
            from: cmd.kenBurns.from ?? 1.0,
            to: cmd.kenBurns.to ?? 1.05,
            pan: cmd.kenBurns.pan || [0,0],
            start: performance.now(),
            duration: cmd.kenBurns.duration || CONFIG.KEN_BURNS_DEFAULT_DURATION,
          };
        }
        break;
      case 'crossfade':
        this.nextSceneKey = cmd.to;
        this.crossfadeStart = performance.now();
        this.crossfadeDuration = cmd.duration || 1500;
        // No setTimeout — commit is handled in update() based on elapsed time.
        break;
      case 'kenBurns':
        this.kenBurns = {
          from: cmd.from ?? 1.0,
          to: cmd.to ?? 1.05,
          pan: cmd.pan || [0,0],
          start: performance.now(),
          duration: cmd.duration || CONFIG.KEN_BURNS_DEFAULT_DURATION,
        };
        break;
      case 'fadeToBlack':
        this.fadeAnim = { from: this.fadeBlackAlpha, to: 1, start: performance.now(), duration: cmd.duration || 1200 };
        break;
      case 'fadeFromBlack':
        this.fadeAnim = { from: this.fadeBlackAlpha, to: 0, start: performance.now(), duration: cmd.duration || 1200 };
        break;
      case 'say':
        this.dialog.say(cmd.char, cmd.text, { duration: cmd.duration, waitForInput: cmd.waitForInput !== false });
        break;
      case 'narrate':
        this.dialog.narrate(cmd.text, { duration: cmd.duration, waitForInput: cmd.waitForInput !== false, tutorial: cmd.tutorial });
        break;
      case 'bgm':
        this.audio.playBgm(cmd.track, { fadeMs: cmd.fadeMs || 1500 });
        break;
      case 'sfx':
        this.audio.playSfx(cmd.url);
        break;
      case 'wait':
        // no-op
        break;
      case 'callback':
        try { cmd.fn(); } catch(e) { console.error(e); }
        break;
      case 'end':
        this.stop();
        break;
      default:
        console.warn('[Cutscene] unknown cmd:', cmd.cmd);
    }
  }

  /** Handle Esc: skip entire cutscene */
  skip() {
    if (!this.active || !this.skippable) return;
    this.stop();
  }

  /** Handle Enter/Space: advance current dialog */
  advance() {
    if (!this.active) return;
    this.dialog.advance();
  }

  /**
   * Draw the scene cutscene full-screen.
   * screenW, screenH are logical dimensions (1920x1080).
   */
  draw(ctx, screenW, screenH) {
    if (!this.active) return;

    // Compute Ken Burns transform
    const kbNow = performance.now();
    const kb = this.kenBurns;
    const kbP = kb.duration > 0 ? Math.min(1, (kbNow - kb.start) / kb.duration) : 0;
    const scale = kb.from + (kb.to - kb.from) * kbP;
    const panX = (kb.pan[0] || 0) * kbP;
    const panY = (kb.pan[1] || 0) * kbP;

    // Draw current scene
    if (this.currentSceneKey) {
      this._drawScene(ctx, this.currentSceneKey, screenW, screenH, scale, panX, panY, 1.0);
    } else {
      // no scene yet — black
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, screenW, screenH);
    }

    // Crossfade: draw next scene on top with alpha
    if (this.nextSceneKey) {
      const fp = Math.min(1, (kbNow - this.crossfadeStart) / this.crossfadeDuration);
      this._drawScene(ctx, this.nextSceneKey, screenW, screenH, scale, panX, panY, fp);
    }

    // Fade to/from black overlay
    if (this.fadeBlackAlpha > 0.001) {
      ctx.fillStyle = `rgba(0,0,0,${this.fadeBlackAlpha})`;
      ctx.fillRect(0, 0, screenW, screenH);
    }
  }

  _drawScene(ctx, key, screenW, screenH, scale, panX, panY, alpha) {
    const img = this.assets.get(key);
    if (!img) {
      // Try as background
      ctx.fillStyle = '#0c0f0d';
      ctx.fillRect(0, 0, screenW, screenH);
      return;
    }

    // Contain: fit image inside screen preserving aspect, letterbox w/ black
    const imgAspect = img.width / img.height;
    const scrAspect = screenW / screenH;
    let renderW, renderH;
    if (imgAspect > scrAspect) {
      renderW = screenW;
      renderH = screenW / imgAspect;
    } else {
      renderH = screenH;
      renderW = screenH * imgAspect;
    }

    // Apply Ken Burns scale
    renderW *= scale;
    renderH *= scale;

    const cx = screenW / 2 + panX;
    const cy = screenH / 2 + panY;
    const dx = cx - renderW / 2;
    const dy = cy - renderH / 2;

    ctx.save();
    ctx.globalAlpha = alpha;
    // Fill letterbox with warm dark
    if (alpha >= 0.99) {
      ctx.fillStyle = '#0c0f0d';
      ctx.fillRect(0, 0, screenW, screenH);
    }
    ctx.drawImage(img, dx, dy, renderW, renderH);
    ctx.restore();
  }
}
