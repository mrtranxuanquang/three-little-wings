// Three Little Wings — Loading scene with Ghibli-style progress bar

import { CONFIG } from '../config.js';

export class LoadingScene {
  constructor(game) {
    this.game = game;
    this.progress = 0;        // 0..1
    this.label = 'Đang tải...';
    this.time = 0;
    this.complete = false;
    this.onDone = null;
  }

  async enter() {
    this.time = 0;
  }

  async exit() {}

  setProgress(p, label) {
    this.progress = Math.max(this.progress, p);
    if (label) this.label = label;
  }

  markComplete() {
    this.complete = true;
  }

  update(dt) {
    this.time += dt;
  }

  draw(ctx) {
    const W = CONFIG.LOGICAL_WIDTH, H = CONFIG.LOGICAL_HEIGHT;

    // Background
    const grd = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H));
    grd.addColorStop(0, '#2d3a2f');
    grd.addColorStop(1, '#0c0f0d');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f5ead0';
    ctx.font = '700 64px "Be Vietnam Pro"';
    ctx.fillText('Three Little Wings', W/2, H/2 - 120);

    ctx.fillStyle = 'rgba(245,234,208,0.7)';
    ctx.font = '400 italic 28px "Be Vietnam Pro"';
    ctx.fillText('Ba Anh Em Vượt Rừng', W/2, H/2 - 70);

    // Progress bar (Ghibli style: wooden rounded)
    const barW = 600, barH = 16;
    const bx = (W - barW) / 2, by = H/2 + 20;

    // Track
    ctx.fillStyle = 'rgba(20,22,18,0.7)';
    this._roundRect(ctx, bx, by, barW, barH, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,234,208,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Fill
    if (this.progress > 0) {
      const fillW = Math.max(18, barW * this.progress);
      ctx.fillStyle = '#d4a574';
      this._roundRect(ctx, bx + 2, by + 2, fillW - 4, barH - 4, 6);
      ctx.fill();
    }

    // Label
    ctx.fillStyle = 'rgba(245,234,208,0.75)';
    ctx.font = '400 20px "Be Vietnam Pro"';
    ctx.fillText(`${this.label} (${Math.floor(this.progress * 100)}%)`, W/2, by + 55);

    // Tip
    ctx.fillStyle = 'rgba(245,234,208,0.4)';
    ctx.font = '400 italic 18px "Be Vietnam Pro"';
    ctx.fillText(this._getRandomTip(), W/2, H - 120);

    ctx.restore();
  }

  _getRandomTip() {
    if (!this._currentTip || this.time - (this._tipTime||0) > 4) {
      const tips = [
        'Mỗi bé có một sức mạnh riêng...',
        'Không ai một mình vượt qua được.',
        'Lắng nghe nhau là phép màu lớn nhất.',
        'Anh em phải luôn yêu thương nhau.',
        'Bấm 1, 2, 3 để chuyển giữa ba anh em.',
      ];
      this._currentTip = tips[Math.floor(Math.random() * tips.length)];
      this._tipTime = this.time;
    }
    return this._currentTip;
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
