// Three Little Wings — Demo-end placeholder (shown after Chapter 1 in Phase 1)

import { CONFIG } from '../config.js';
import { Input } from '../input.js';

export class DemoEndScene {
  constructor(game) {
    this.game = game;
    this.time = 0;
    this.fadeIn = 0;
  }

  async enter() {
    this.time = 0;
  }

  async exit() {}

  update(dt) {
    this.time += dt;
    this.fadeIn = Math.min(1, this.time / 1.8);

    if (this.time > 2.5) {
      if (Input.consumePressed('advance') || Input.consumePressed('jump')) {
        this.game.returnToMenu();
      }
    }
  }

  draw(ctx) {
    const W = CONFIG.LOGICAL_WIDTH, H = CONFIG.LOGICAL_HEIGHT;

    // Dark warm background
    const grd = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H));
    grd.addColorStop(0, '#1f2a22');
    grd.addColorStop(1, '#0c0f0d');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalAlpha = this.fadeIn;
    ctx.textAlign = 'center';

    ctx.fillStyle = '#d4a574';
    ctx.font = '600 italic 32px "Be Vietnam Pro"';
    ctx.fillText('🌿  Kết thúc bản demo  🌿', W/2, H/2 - 160);

    ctx.fillStyle = '#f5ead0';
    ctx.font = '500 38px "Be Vietnam Pro"';
    ctx.fillText('Chương 1 đã hoàn thành!', W/2, H/2 - 70);

    ctx.fillStyle = 'rgba(245,234,208,0.8)';
    ctx.font = '400 26px "Be Vietnam Pro"';
    // Multi-line message
    const msg = [
      'Cuộc hành trình của ba anh em mới chỉ bắt đầu.',
      'Suối đá, rừng hoa, hang tối, và ngôi nhà ấm cúng đang chờ...',
      '',
      'Bố sẽ hoàn thiện các chương tiếp theo sớm.',
    ];
    msg.forEach((line, i) => ctx.fillText(line, W/2, H/2 + 10 + i * 42));

    if (this.time > 2.5) {
      const blink = Math.sin(this.time * 3) * 0.3 + 0.7;
      ctx.globalAlpha = this.fadeIn * blink;
      ctx.fillStyle = 'rgba(245,234,208,0.7)';
      ctx.font = '400 22px "Be Vietnam Pro"';
      ctx.fillText('↵  về màn hình chính', W/2, H - 120);
    }
    ctx.restore();
  }
}
