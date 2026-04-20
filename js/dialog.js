// Three Little Wings — Dialog system

import { CONFIG } from './config.js';

/**
 * DialogManager queues dialog items; they display one at a time.
 * UI draws on top of gameplay (world-space bubbles for 'say',
 * screen-space banner for 'narrate').
 *
 *   dialog.say('chien', 'Ơ! Bướm đẹp quá!', { duration: 2500 })
 *   dialog.narrate('Một chiều cuối tuần...', { duration: 4000 })
 *
 * Returns a promise that resolves when dialog finishes (closed or timed out).
 */

export class DialogManager {
  constructor(characters) {
    this.characters = characters;  // { choe, cucu, chien, ... }
    this.current = null;
    this.queue = [];
    this.typeStartTime = 0;
  }

  isActive() { return !!this.current; }

  /**
   * Speech bubble attached to a character.
   * opts: { duration, color, waitForInput }
   */
  say(charId, text, opts = {}) {
    return new Promise((resolve) => {
      this.queue.push({
        kind: 'say',
        charId,
        text,
        duration: opts.duration || Math.max(1800, text.length * 80),
        waitForInput: opts.waitForInput !== false,
        color: opts.color || null,
        resolve,
      });
      this._tryStart();
    });
  }

  narrate(text, opts = {}) {
    return new Promise((resolve) => {
      this.queue.push({
        kind: 'narrate',
        text,
        duration: opts.duration || Math.max(2500, text.length * 70),
        waitForInput: opts.waitForInput !== false,
        tutorial: opts.tutorial || false,
        resolve,
      });
      this._tryStart();
    });
  }

  _tryStart() {
    if (this.current || this.queue.length === 0) return;
    this.current = this.queue.shift();
    this.current.startTime = performance.now();
    this.current.charsShown = 0;
    this.current.done = false;
  }

  /** Advance (skip typewriter, then close). Called by 'advance' input. */
  advance() {
    if (!this.current) return;
    const elapsed = performance.now() - this.current.startTime;
    if (elapsed < CONFIG.DIALOG_MIN_DISPLAY) return;

    if (!this.current.done) {
      // First advance: show full text immediately
      this.current.charsShown = this.current.text.length;
      this.current.done = true;
    } else {
      // Second advance: dismiss
      this._close();
    }
  }

  _close() {
    if (this.current) {
      this.current.resolve();
      this.current = null;
    }
    this._tryStart();
  }

  update(dt) {
    if (!this.current) return;
    const elapsed = performance.now() - this.current.startTime;

    // Typewriter progress
    const desiredChars = Math.floor((elapsed / 1000) * CONFIG.TYPEWRITER_CHARS_PER_SECOND);
    this.current.charsShown = Math.min(this.current.text.length, desiredChars);
    if (this.current.charsShown >= this.current.text.length) this.current.done = true;

    // Auto-dismiss if not waiting for input
    if (!this.current.waitForInput && elapsed > this.current.duration) {
      this._close();
    }
  }

  clear() {
    for (const item of this.queue) item.resolve();
    if (this.current) this.current.resolve();
    this.queue = [];
    this.current = null;
  }

  /** Draw dialog on top of gameplay. */
  draw(ctx, camera, screenW, screenH) {
    if (!this.current) return;
    const it = this.current;
    const visibleText = it.text.substring(0, it.charsShown);

    if (it.kind === 'say') {
      const ch = this.characters[it.charId];
      if (!ch) return;
      // World -> screen
      const sx = ch.x - camera.x;
      const sy = ch.y - ch.height - 40 - camera.y;
      this._drawSpeechBubble(ctx, sx, sy, visibleText, it, screenW, screenH);
    } else {
      // narrate
      this._drawNarrationBanner(ctx, screenW, screenH, visibleText, it);
    }
  }

  _drawSpeechBubble(ctx, x, y, text, item, screenW, screenH) {
    ctx.save();
    ctx.font = '500 26px "Be Vietnam Pro", sans-serif';
    const maxWidth = 560;
    const lines = this._wrapText(ctx, text, maxWidth);
    const lineHeight = 34;
    const padX = 24, padY = 18;
    const w = Math.max(120, Math.min(maxWidth, this._maxLineWidth(ctx, lines))) + padX * 2;
    const h = lines.length * lineHeight + padY * 2 - 4;

    let bx = x - w / 2;
    let by = y - h;

    const margin = 12;
    if (screenW) bx = Math.max(margin, Math.min(screenW - w - margin, bx));
    if (screenH) by = Math.max(margin, by);

    const tailX = Math.max(bx + 16, Math.min(bx + w - 16, x));

    // Pop-in scale: 0.75 → 1.0 over first 140ms
    const age = performance.now() - item.startTime;
    const popScale = age < 140 ? 0.75 + 0.25 * (age / 140) : 1;
    if (popScale < 1) {
      const pivotX = bx + w / 2, pivotY = by + h / 2;
      ctx.translate(pivotX, pivotY);
      ctx.scale(popScale, popScale);
      ctx.translate(-pivotX, -pivotY);
    }

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    this._roundRect(ctx, bx + 3, by + 4, w, h, 18); ctx.fill();

    // Bubble
    ctx.fillStyle = 'rgba(255, 251, 238, 0.97)';
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 2;
    this._roundRect(ctx, bx, by, w, h, 18);
    ctx.fill(); ctx.stroke();

    // Tail
    ctx.beginPath();
    ctx.moveTo(tailX - 10, by + h);
    ctx.lineTo(tailX, by + h + 18);
    ctx.lineTo(tailX + 10, by + h);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 251, 238, 0.97)';
    ctx.fill();
    ctx.strokeStyle = '#3a2a1a';
    ctx.stroke();

    // Character name tag (top-left of bubble)
    const charColor = item.color || CONFIG.CHARACTER_COLORS[item.charId] || '#3a2a1a';
    ctx.font = '600 15px "Be Vietnam Pro", sans-serif';
    ctx.fillStyle = charColor;
    ctx.fillText(CONFIG.CHARACTER_NAMES[item.charId] || '', bx + padX, by - 8);

    // Text
    ctx.font = '500 26px "Be Vietnam Pro", sans-serif';
    ctx.fillStyle = '#2a1e14';
    ctx.textBaseline = 'top';
    lines.forEach((ln, i) => ctx.fillText(ln, bx + padX, by + padY + i * lineHeight));

    // Advance indicator (blinking arrow when fully typed)
    if (item.done && item.waitForInput) {
      const t = (performance.now() / 400) % 2;
      if (t < 1) {
        ctx.fillStyle = '#7a5b3a';
        ctx.beginPath();
        ctx.moveTo(bx + w - 22, by + h - 14);
        ctx.lineTo(bx + w - 14, by + h - 14);
        ctx.lineTo(bx + w - 18, by + h - 8);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  _drawNarrationBanner(ctx, screenW, screenH, text, item) {
    ctx.save();
    // Fade-in: 0 → 1 over first 220ms
    const age = performance.now() - item.startTime;
    ctx.globalAlpha = age < 220 ? age / 220 : 1;
    ctx.font = '500 28px "Be Vietnam Pro", sans-serif';
    const maxWidth = Math.min(screenW - 120, 1100);
    const lines = this._wrapText(ctx, text, maxWidth);
    const lineHeight = 38;
    const padX = 40, padY = 24;
    const w = maxWidth + padX * 2;
    const h = lines.length * lineHeight + padY * 2;
    const bx = (screenW - w) / 2;
    const by = item.tutorial ? 60 : screenH - h - 70;

    // Background
    ctx.fillStyle = 'rgba(20, 22, 18, 0.82)';
    ctx.strokeStyle = 'rgba(245, 234, 208, 0.3)';
    ctx.lineWidth = 1.5;
    this._roundRect(ctx, bx, by, w, h, 10);
    ctx.fill(); ctx.stroke();

    // Text
    ctx.fillStyle = '#f5ead0';
    ctx.textBaseline = 'top';
    ctx.font = item.tutorial
      ? '500 26px "Be Vietnam Pro", sans-serif'
      : '400 italic 28px "Be Vietnam Pro", sans-serif';
    lines.forEach((ln, i) => {
      const tx = bx + padX;
      ctx.fillText(ln, tx, by + padY + i * lineHeight);
    });

    // Advance hint
    if (item.done && item.waitForInput) {
      const t = (performance.now() / 500) % 2;
      if (t < 1) {
        ctx.fillStyle = 'rgba(245,234,208,0.7)';
        ctx.font = '400 18px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('↵ tiếp tục', bx + w - padX, by + h - padY - 12);
        ctx.textAlign = 'left';
      }
    }
    ctx.restore();
  }

  _wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > maxWidth && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  _maxLineWidth(ctx, lines) {
    let max = 0;
    for (const ln of lines) {
      const w = ctx.measureText(ln).width;
      if (w > max) max = w;
    }
    return max;
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
