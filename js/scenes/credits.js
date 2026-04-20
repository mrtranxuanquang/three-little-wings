// Three Little Wings — Credits Scene
//
// Typewriter text on white, then dedication on black.
// Background: bg_credits. Piano BGM fades in.

import { CONFIG } from '../config.js';

const TYPEWRITER_TEXT = 'Anh em phải bảo vệ và yêu thương nhau...';

const DEDICATION_LINES = [
  { text: 'THREE LITTLE WINGS', size: 52, bold: true, gap: 40 },
  { text: '',                   size: 16, bold: false, gap: 28 },
  { text: 'Dành tặng',          size: 26, bold: false, gap: 52 },
  { text: 'Khôi Vĩ',            size: 42, bold: true,  gap: 8  },
  { text: '25 tháng 04 năm 2014', size: 22, bold: false, gap: 48 },
  { text: 'Khôi Nguyên',        size: 42, bold: true,  gap: 8  },
  { text: '03 tháng 10 năm 2017', size: 22, bold: false, gap: 48 },
  { text: 'Khôi Trí',           size: 42, bold: true,  gap: 8  },
  { text: '04 tháng 03 năm 2019', size: 22, bold: false, gap: 52 },
  { text: 'Với tất cả tình yêu của bố.', size: 26, bold: false, gap: 60 },
  { text: '—',                  size: 28, bold: false, gap: 40 },
  { text: '"Anh em phải bảo vệ và yêu thương nhau."', size: 22, bold: false, italic: true, gap: 8 },
  { text: '— Bố Quang',         size: 20, bold: false, gap: 64 },
  { text: 'Built by Bố Quang Lukas',        size: 18, bold: false, gap: 6  },
  { text: 'using love, patience, and a lot of coffee', size: 16, bold: false, gap: 24 },
  { text: 'threelittlewings.tranxuanquang.vn', size: 16, bold: false, gap: 0 },
];

const PHASE = {
  WHITE_TYPEWRITER: 0,
  WHITE_HOLD:       1,
  FADE_TO_BLACK:    2,
  CREDITS_SCROLL:   3,
  HOLD_END:         4,
  FADE_OUT:         5,
  DONE:             6,
};

export class CreditsScene {
  constructor(game) {
    this.game = game;
    this.phase = PHASE.WHITE_TYPEWRITER;
    this.timer = 0;
    this.typeIndex = 0;
    this.typeTimer = 0;
    this.overlayAlpha = 1;   // starts white (1 = white, 0 = transparent)
    this.scrollY = CONFIG.LOGICAL_HEIGHT;
    this.creditsDone = false;
  }

  async enter() {
    this.phase = PHASE.WHITE_TYPEWRITER;
    this.timer = 0;
    this.typeIndex = 0;
    this.typeTimer = 0;
    this.overlayAlpha = 1;
    this.scrollY = CONFIG.LOGICAL_HEIGHT * 1.1;

    this.game.audio.playBgm('audio/bgm_credits.mp3', { fadeMs: 3000 });
  }

  async exit() {}

  update(dt) {
    this.timer += dt;

    switch (this.phase) {
      case PHASE.WHITE_TYPEWRITER: {
        this.typeTimer += dt;
        const charsPerSec = 28;
        const target = Math.min(TYPEWRITER_TEXT.length, (this.typeTimer * charsPerSec) | 0);
        this.typeIndex = target;
        if (this.typeIndex >= TYPEWRITER_TEXT.length) {
          this.phase = PHASE.WHITE_HOLD;
          this.timer = 0;
        }
        break;
      }
      case PHASE.WHITE_HOLD:
        if (this.timer > 3.5) {
          this.phase = PHASE.FADE_TO_BLACK;
          this.timer = 0;
        }
        break;
      case PHASE.FADE_TO_BLACK:
        this.overlayAlpha = 1 - Math.min(1, this.timer / 1.8);
        if (this.timer > 1.8) {
          this.overlayAlpha = 0;
          this.phase = PHASE.CREDITS_SCROLL;
          this.timer = 0;
        }
        break;
      case PHASE.CREDITS_SCROLL: {
        const speed = 55;
        this.scrollY -= speed * dt;
        const totalH = DEDICATION_LINES.reduce((a, l) => a + l.size + l.gap + 10, 0);
        if (this.scrollY < -totalH) {
          this.phase = PHASE.HOLD_END;
          this.timer = 0;
        }
        break;
      }
      case PHASE.HOLD_END:
        if (this.timer > 3) {
          this.phase = PHASE.FADE_OUT;
          this.timer = 0;
        }
        break;
      case PHASE.FADE_OUT:
        if (this.timer > 2.5) {
          this.phase = PHASE.DONE;
          setTimeout(() => this.game.returnToMenu(), 400);
        }
        break;
    }
  }

  draw(ctx) {
    const W = CONFIG.LOGICAL_WIDTH, H = CONFIG.LOGICAL_HEIGHT;

    if (this.phase <= PHASE.WHITE_HOLD) {
      // White background
      ctx.fillStyle = '#fdf6ec';
      ctx.fillRect(0, 0, W, H);

      // Typewriter text centered
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1a1208';
      ctx.font = 'italic 400 36px "Be Vietnam Pro"';
      const displayed = TYPEWRITER_TEXT.slice(0, this.typeIndex);
      ctx.fillText(displayed, W / 2, H / 2);
      // Blinking cursor
      if (this.typeIndex < TYPEWRITER_TEXT.length || ((performance.now() / 500 | 0) % 2 === 0)) {
        ctx.fillStyle = '#8a7a68';
        ctx.fillRect(W / 2 + ctx.measureText(displayed).width / 2 + 4, H / 2 - 18, 2, 36);
      }
      ctx.restore();
    } else if (this.phase === PHASE.FADE_TO_BLACK) {
      // Crossfade white → black
      ctx.fillStyle = `rgb(${(253 * this.overlayAlpha) | 0},${(246 * this.overlayAlpha) | 0},${(236 * this.overlayAlpha) | 0})`;
      ctx.fillRect(0, 0, W, H);
      // Also fade out the text
      ctx.save();
      ctx.globalAlpha = this.overlayAlpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1a1208';
      ctx.font = 'italic 400 36px "Be Vietnam Pro"';
      ctx.fillText(TYPEWRITER_TEXT, W / 2, H / 2);
      ctx.restore();
    } else {
      // Dark background for credits scroll
      const bg = this.game.assets.get('bg_credits');
      if (bg) {
        const scale = H / bg.height;
        ctx.drawImage(bg, (W - bg.width * scale) / 2, 0, bg.width * scale, H);
        // Dim overlay
        ctx.fillStyle = 'rgba(8,6,4,0.72)';
        ctx.fillRect(0, 0, W, H);
      } else {
        ctx.fillStyle = '#100d08';
        ctx.fillRect(0, 0, W, H);
      }

      // Scrolling credits text
      ctx.save();
      ctx.textAlign = 'center';
      let cy = this.scrollY;
      for (const line of DEDICATION_LINES) {
        if (cy > -line.size && cy < H + line.size + 40) {
          ctx.font = `${line.bold ? '700' : (line.italic ? 'italic 400' : '400')} ${line.size}px "Be Vietnam Pro"`;
          ctx.fillStyle = line.bold ? '#f5ead0' : '#c8b89a';
          ctx.textBaseline = 'top';
          ctx.fillText(line.text, W / 2, cy);
        }
        cy += line.size + line.gap + 10;
      }
      ctx.restore();

      // Fade out at the end
      if (this.phase === PHASE.FADE_OUT) {
        const a = Math.min(1, this.timer / 2.5);
        ctx.fillStyle = `rgba(0,0,0,${a})`;
        ctx.fillRect(0, 0, W, H);
      }
    }
  }
}
