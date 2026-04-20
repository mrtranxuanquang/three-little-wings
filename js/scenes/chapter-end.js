// Three Little Wings — End-of-chapter transition scene

import { CONFIG } from '../config.js';
import { Input } from '../input.js';

export class ChapterEndScene {
  constructor(game, justCompleted, nextChapter) {
    this.game = game;
    this.justCompleted = justCompleted;   // e.g. "Chương 1 — Bìa Rừng"
    this.nextChapter = nextChapter;       // chapter number
    this.time = 0;
    this.fadeIn = 0;
  }

  async enter() {
    this.time = 0;
    this.game.audio.playBgm(null, { fadeMs: 1500 }); // fade out BGM
  }

  async exit() {}

  update(dt) {
    this.time += dt;
    this.fadeIn = Math.min(1, this.time / 1.5);

    // After 3 seconds, can be advanced
    if (this.time > 3) {
      if (Input.consumePressed('advance') || Input.consumePressed('jump')) {
        this._continue();
      }
    }
    // Auto-continue after 7 seconds (non-Ch1 chapters will be built later)
    if (this.time > 7.5) this._continue();
  }

  _continue() {
    if (this._continuing) return;
    this._continuing = true;
    // Save progress
    try {
      localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify({
        chapter: this.nextChapter,
        savedAt: Date.now(),
      }));
    } catch(e) {}

    // For Phase 1: only Ch1 is built. Show "tiếp theo sẽ có" and return to menu.
    if (this.nextChapter > 1 && !this.game.hasChapter(this.nextChapter)) {
      this.game.showDemoEnd();
    } else {
      this.game.startChapter(this.nextChapter);
    }
  }

  draw(ctx) {
    const W = CONFIG.LOGICAL_WIDTH, H = CONFIG.LOGICAL_HEIGHT;

    // Black background
    ctx.fillStyle = '#0c0f0d';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalAlpha = this.fadeIn;
    ctx.textAlign = 'center';

    // Decorative line
    ctx.strokeStyle = 'rgba(245,234,208,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W/2 - 180, H/2 - 90); ctx.lineTo(W/2 + 180, H/2 - 90);
    ctx.stroke();

    // Chapter done label
    ctx.fillStyle = 'rgba(245,234,208,0.6)';
    ctx.font = '400 italic 26px "Be Vietnam Pro"';
    ctx.fillText('— HẾT —', W/2, H/2 - 40);

    // Chapter title
    ctx.fillStyle = '#f5ead0';
    ctx.font = '600 46px "Be Vietnam Pro"';
    ctx.fillText(this.justCompleted, W/2, H/2 + 30);

    // Decorative line
    ctx.strokeStyle = 'rgba(245,234,208,0.4)';
    ctx.beginPath();
    ctx.moveTo(W/2 - 180, H/2 + 90); ctx.lineTo(W/2 + 180, H/2 + 90);
    ctx.stroke();

    // Continue hint
    if (this.time > 3) {
      const blink = Math.sin(this.time * 3) * 0.3 + 0.7;
      ctx.globalAlpha = this.fadeIn * blink;
      ctx.fillStyle = 'rgba(245,234,208,0.7)';
      ctx.font = '400 22px "Be Vietnam Pro"';
      ctx.fillText('↵  để tiếp tục', W/2, H - 120);
    }
    ctx.restore();
  }
}
