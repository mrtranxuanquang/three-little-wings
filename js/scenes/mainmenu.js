// Three Little Wings — Main Menu Scene

import { CONFIG } from '../config.js';
import { Input } from '../input.js';

export class MainMenuScene {
  constructor(game) {
    this.game = game;
    this.time = 0;
    this.buttons = [];
    this.hovered = -1;
    this.titleAlpha = 0;
    this.contentAlpha = 0;
  }

  async enter() {
    this.time = 0;
    this._setupButtons();
    this._setupTouchHitboxes();

    // Try BGM (will fail silently if file missing)
    this.game.audio.playBgm('audio/bgm_menu.mp3', { fadeMs: 2000 });
  }

  async exit() {
    Input.setTouchButtons([]); // clear menu-specific touch hit areas
  }

  /**
   * Register per-button touch hitboxes (in client/viewport coords) so mobile
   * users can tap buttons directly. Each button fires its own 'advance'-like
   * action which we read as a synthetic switch1/switch2 selection.
   */
  _setupTouchHitboxes() {
    // We register buttons mapped to switch1/switch2 actions — which update()
    // already handles for keyboard navigation. Works for mouse & touch alike.
    const logicalToClient = (lx, ly) => ({
      x: lx * this.game.scale + this.game.offsetX,
      y: ly * this.game.scale + this.game.offsetY,
    });
    const bw = 480, bh = 104;
    const hitboxes = [];
    for (let i = 0; i < this.buttons.length && i < 2; i++) {
      const b = this.buttons[i];
      const tl = logicalToClient(b.x - bw/2, b.y - bh/2);
      const br = logicalToClient(b.x + bw/2, b.y + bh/2);
      hitboxes.push({
        id: `menu${i}`,
        action: i === 0 ? 'switch1' : 'switch2',
        x: tl.x, y: tl.y,
        w: br.x - tl.x, h: br.y - tl.y,
      });
    }
    Input.setTouchButtons(hitboxes);
  }

  _setupButtons() {
    const hasSave = !!localStorage.getItem(CONFIG.SAVE_KEY);
    const cx = CONFIG.LOGICAL_WIDTH / 2;
    const startY = 640;
    const gap = 110;

    this.buttons = [];
    if (hasSave) {
      this.buttons.push({ label: '🌿  Tiếp tục hành trình', action: 'continue', x: cx, y: startY });
      this.buttons.push({ label: 'Bắt đầu lại từ đầu',     action: 'new',      x: cx, y: startY + gap });
    } else {
      this.buttons.push({ label: '🌿  Bắt đầu hành trình', action: 'new',      x: cx, y: startY });
    }
  }

  update(dt) {
    this.time += dt;
    this.titleAlpha = Math.min(1, this.time / 1.2);
    this.contentAlpha = Math.max(0, Math.min(1, (this.time - 0.8) / 0.8));

    // Update hovered button (for mouse)
    const pt = this._getPointer();
    this.hovered = -1;
    if (pt) {
      for (let i = 0; i < this.buttons.length; i++) {
        const b = this.buttons[i];
        const bw = 480, bh = 104;
        if (pt.x >= b.x - bw/2 && pt.x <= b.x + bw/2 &&
            pt.y >= b.y - bh/2 && pt.y <= b.y + bh/2) {
          this.hovered = i;
          break;
        }
      }
    }

    // Handle click/advance
    if (Input.consumePressed('advance') || Input.consumePressed('jump')) {
      if (this.hovered >= 0) {
        this._clickButton(this.hovered);
      } else if (this.buttons.length === 1 && this.contentAlpha >= 0.99) {
        // if there's only one button and user clicks anywhere, start new game
        // NO — require explicit click on button
      }
    }

    // Keyboard nav: arrow keys + enter
    if (Input.consumePressed('switch1')) this._clickButton(0);
    if (Input.consumePressed('switch2') && this.buttons.length > 1) this._clickButton(1);
  }

  _getPointer() { return this.game.pointerLogical; }

  _clickButton(idx) {
    const btn = this.buttons[idx];
    if (!btn) return;
    this.game.audio.resume();  // user gesture — unlock audio
    if (btn.action === 'new') {
      localStorage.removeItem(CONFIG.SAVE_KEY);
      this.game.startChapter(1);
    } else if (btn.action === 'continue') {
      const saved = JSON.parse(localStorage.getItem(CONFIG.SAVE_KEY) || '{}');
      const ch = saved.chapter || 1;
      this.game.startChapter(ch);
    }
  }

  draw(ctx) {
    const W = CONFIG.LOGICAL_WIDTH, H = CONFIG.LOGICAL_HEIGHT;

    // Background
    const bg = this.game.assets.get('bg_mainmenu');
    if (bg) {
      // Cover to fill
      const ratio = Math.max(W / bg.width, H / bg.height);
      const w = bg.width * ratio, h = bg.height * ratio;
      ctx.drawImage(bg, (W - w)/2, (H - h)/2, w, h);
    } else {
      ctx.fillStyle = '#2d3a2f';
      ctx.fillRect(0, 0, W, H);
    }

    // Vignette
    const grd = ctx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.3, W/2, H/2, Math.max(W,H)*0.7);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.save();
    ctx.globalAlpha = this.titleAlpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.font = '700 98px "Be Vietnam Pro", sans-serif';
    ctx.fillText('Three Little Wings', W/2 + 4, 280 + 4);

    ctx.fillStyle = '#f5ead0';
    ctx.fillText('Three Little Wings', W/2, 280);

    ctx.fillStyle = 'rgba(245,234,208,0.85)';
    ctx.font = '400 italic 36px "Be Vietnam Pro", sans-serif';
    ctx.fillText('Ba Anh Em Vượt Rừng', W/2, 360);

    // Decorative line
    ctx.strokeStyle = 'rgba(245,234,208,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W/2 - 140, 410); ctx.lineTo(W/2 + 140, 410);
    ctx.stroke();
    ctx.restore();

    // Buttons
    ctx.save();
    ctx.globalAlpha = this.contentAlpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < this.buttons.length; i++) {
      const b = this.buttons[i];
      const bw = 480, bh = 104;
      const bx = b.x - bw/2, by = b.y - bh/2;
      const isHover = i === this.hovered;

      // Button bg
      ctx.fillStyle = isHover ? 'rgba(245, 234, 208, 0.92)' : 'rgba(245, 234, 208, 0.12)';
      ctx.strokeStyle = 'rgba(245, 234, 208, 0.7)';
      ctx.lineWidth = 2;
      this._roundRect(ctx, bx, by, bw, bh, 12);
      ctx.fill(); ctx.stroke();

      // Label
      ctx.fillStyle = isHover ? '#2a1e14' : '#f5ead0';
      ctx.font = '600 30px "Be Vietnam Pro", sans-serif';
      ctx.fillText(b.label, b.x, b.y);
    }
    ctx.restore();

    // Footer
    ctx.save();
    ctx.globalAlpha = this.contentAlpha;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(245,234,208,0.55)';
    ctx.font = '400 italic 20px "Be Vietnam Pro", sans-serif';
    ctx.fillText('Dành tặng Khôi Vĩ, Khôi Nguyên và Khôi Trí — với tất cả tình yêu của bố',
      W/2, H - 60);
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
