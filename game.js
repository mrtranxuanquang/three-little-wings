// Three Little Wings — Game root
// Orchestrates: game loop, viewport/canvas, scene manager, input, assets

import { CONFIG } from './js/config.js';
import { AssetLoader, LOAD_PHASES } from './js/assets.js';
import { Input } from './js/input.js';
import { Audio } from './js/audio.js';

import { LoadingScene } from './js/scenes/loading.js';
import { MainMenuScene } from './js/scenes/mainmenu.js';
import { GameplayScene } from './js/scenes/gameplay.js';
import { ChapterEndScene } from './js/scenes/chapter-end.js';
import { DemoEndScene } from './js/scenes/demo-end.js';

import { CHAPTER_1 } from './js/chapters/chapter1.js';
import { CHAPTER_2 } from './js/chapters/chapter2.js';
import { CHAPTER_3 } from './js/chapters/chapter3.js';
import { CHAPTER_4 } from './js/chapters/chapter4.js';
import { CHAPTER_5 } from './js/chapters/chapter5.js';
import { CHAPTER_6 } from './js/chapters/chapter6.js';
import { CHAPTER_7 } from './js/chapters/chapter7.js';
import { CHAPTER_8 } from './js/chapters/chapter8.js';

const CHAPTERS = {
  1: CHAPTER_1,
  2: CHAPTER_2,
  3: CHAPTER_3,
  4: CHAPTER_4,
  5: CHAPTER_5,
  6: CHAPTER_6,
  7: CHAPTER_7,
  8: CHAPTER_8,
};

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.assets = new AssetLoader();
    this.audio = Audio;

    this.scene = null;
    this.nextScene = null;
    this.paused = false;
    this.lastTime = 0;
    this.pointerLogical = null;  // for hover in menus

    // Viewport scaling
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    Input.install(this.canvas);
    this._wirePointerTracking();
    this._setupResize();
    this._setupAudioUnlock();
  }

  _setupAudioUnlock() {
    // Browsers require user gesture to create AudioContext.
    // Init on first click/touch/key, then remove listeners.
    const unlock = () => {
      this.audio.init();
      this.audio.resume();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }

  async boot() {
    // Phase 1: load essential assets (for splash/menu)
    const loadingScene = new LoadingScene(this);
    await this._switchTo(loadingScene);

    try {
      await this.assets.load(LOAD_PHASES.essential, (loaded, total) => {
        loadingScene.setProgress(loaded / total * 0.3, 'Đang tải tài nguyên cơ bản...');
      });

      // Phase 2: Chapter 1 assets (required for gameplay)
      await this.assets.load(LOAD_PHASES.chapter1, (loaded, total) => {
        loadingScene.setProgress(0.3 + (loaded / total) * 0.7, 'Đang tải Chương 1...');
      });

      loadingScene.setProgress(1.0, 'Sẵn sàng!');
      await this._sleep(400);

      // Report any failed assets so they're obvious in console
      this.assets.reportFailures();

      // Kick off background loading of later assets (fire and forget)
      this.assets.loadRestInBackground();

      // Hide boot splash
      const bootSplash = document.getElementById('boot-splash');
      if (bootSplash) {
        bootSplash.classList.add('hidden');
        setTimeout(() => bootSplash.remove(), 700);
      }

      // Go to main menu
      await this._switchTo(new MainMenuScene(this));
      this._startLoop();
    } catch (e) {
      console.error('[Game] Boot failed:', e);
      alert('Không tải được tài nguyên: ' + e.message);
    }
  }

  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async _switchTo(scene) {
    if (this.scene && this.scene.exit) await this.scene.exit();
    this.scene = scene;
    if (scene.enter) await scene.enter();
  }

  hasChapter(n) { return !!CHAPTERS[n]; }

  async startChapter(n) {
    const ch = CHAPTERS[n];
    if (!ch) {
      console.warn('[Game] chapter not yet built:', n);
      this.showDemoEnd();
      return;
    }
    // Make sure its assets are loaded
    const bgKey = ch.background;
    if (!this.assets.has(bgKey)) {
      const loading = new LoadingScene(this);
      await this._switchTo(loading);
      await this.assets.load([bgKey], (l, t) => loading.setProgress(l/t, 'Đang vào chương...'));
    }
    await this._switchTo(new GameplayScene(this, ch));
    this._setupGameplayTouchButtons();
  }

  async completeChapter(nextN) {
    const current = this.scene?.chapter;
    const label = current ? `Chương ${current.number} — ${current.title}` : `Chương ${nextN - 1}`;
    await this._switchTo(new ChapterEndScene(this, label, nextN));
    Input.setTouchButtons([]);
  }

  async showChapterEnd(title, nextN) {
    await this._switchTo(new ChapterEndScene(this, title, nextN));
    Input.setTouchButtons([]);
  }

  async showDemoEnd() {
    await this._switchTo(new DemoEndScene(this));
    Input.setTouchButtons([]);
  }

  async returnToMenu() {
    await this._switchTo(new MainMenuScene(this));
  }

  togglePause() {
    this.paused = !this.paused;
  }

  _startLoop() {
    this.lastTime = performance.now();
    const loop = (now) => {
      const dt = Math.min(1/20, (now - this.lastTime) / 1000); // cap at 50ms
      this.lastTime = now;

      if (!this.paused && this.scene) this.scene.update(dt);

      // Render
      this._render();

      // Clear pressed (edge) events
      Input.update();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  _render() {
    const ctx = this.ctx;
    // Clear viewport
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply logical -> physical transform
    ctx.setTransform(this.scale * this.dpr, 0, 0, this.scale * this.dpr,
                     this.offsetX * this.dpr, this.offsetY * this.dpr);

    if (this.scene) this.scene.draw(ctx);
  }

  _setupResize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const handleResize = () => {
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Fit 1920x1080 into viewport with letterbox
      const scale = Math.min(viewW / CONFIG.LOGICAL_WIDTH, viewH / CONFIG.LOGICAL_HEIGHT);
      const displayW = CONFIG.LOGICAL_WIDTH * scale;
      const displayH = CONFIG.LOGICAL_HEIGHT * scale;
      this.scale = scale;
      this.offsetX = (viewW - displayW) / 2;
      this.offsetY = (viewH - displayH) / 2;
      this.viewW = viewW;
      this.viewH = viewH;

      // Canvas physical size
      this.canvas.style.width = viewW + 'px';
      this.canvas.style.height = viewH + 'px';
      this.canvas.width = viewW * this.dpr;
      this.canvas.height = viewH * this.dpr;

      // Re-layout gameplay touch buttons
      if (this.scene instanceof GameplayScene) this._setupGameplayTouchButtons();
      // Menu also needs touch hitboxes on mobile
      if (this.scene instanceof MainMenuScene && this.scene._setupTouchHitboxes) {
        this.scene._setupTouchHitboxes();
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize();
  }

  /** Convert client/viewport coords to logical (1920x1080) coords. */
  clientToLogical(clientX, clientY) {
    return {
      x: (clientX - this.offsetX) / this.scale,
      y: (clientY - this.offsetY) / this.scale,
    };
  }

  /** Get current touch buttons in LOGICAL space (for drawing). */
  getLogicalTouchButtons() {
    const out = [];
    for (const b of Input.touchButtons.values()) {
      const tl = this.clientToLogical(b.x, b.y);
      const br = this.clientToLogical(b.x + b.w, b.y + b.h);
      out.push({
        id: b.id,
        action: b.action,
        x: tl.x,
        y: tl.y,
        w: br.x - tl.x,
        h: br.y - tl.y,
        shape: b.shape,
        held: !!b.mouseHeld || this._anyTouchOnButton(b.id),
      });
    }
    return out;
  }

  _anyTouchOnButton(btnId) {
    for (const [, bid] of Input._activeTouches) if (bid === btnId) return true;
    return false;
  }

  _wirePointerTracking() {
    const handle = (e) => {
      const cx = e.clientX ?? (e.touches && e.touches[0]?.clientX);
      const cy = e.clientY ?? (e.touches && e.touches[0]?.clientY);
      if (cx == null) return;
      // Convert to logical coords
      const lx = (cx - this.offsetX) / this.scale;
      const ly = (cy - this.offsetY) / this.scale;
      this.pointerLogical = { x: lx, y: ly };
    };
    this.canvas.addEventListener('mousemove', handle);
    this.canvas.addEventListener('touchstart', handle, { passive: true });
    this.canvas.addEventListener('mouseleave', () => { this.pointerLogical = null; });
  }

  _setupGameplayTouchButtons() {
    // Only install touch buttons if we appear to be on a touch device
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch) {
      Input.setTouchButtons([]);
      this._drawTouchOverlay = false;
      return;
    }

    const viewW = this.viewW || window.innerWidth;
    const viewH = this.viewH || window.innerHeight;

    // Scale button sizes with viewport so they feel right on phones & tablets.
    // Base on viewport min dimension (usually height in landscape).
    const unit = Math.max(14, Math.min(viewW, viewH) * 0.024); // ≈ touch sizing unit
    const dpadSize = Math.round(unit * 5.5);   // ~130 on iPhone, ~150 on tablets
    const jumpSize = Math.round(unit * 6.8);
    const skillSize = Math.round(unit * 5.2);
    const pad = Math.round(unit * 2.2);

    // Bottom-left: dpad (left | right), sitting above the bottom edge
    const dpadY = viewH - dpadSize - pad;
    const leftX = pad;
    const rightX = pad + dpadSize + Math.round(unit * 1.2);

    // Bottom-right: jump (big) + skill (smaller, left of jump)
    const jumpX = viewW - pad - jumpSize;
    const jumpY = viewH - pad - jumpSize;
    const skillX = jumpX - skillSize - Math.round(unit * 1.3);
    const skillY = viewH - pad - skillSize - Math.round(unit * 0.5);

    // Top-right: character swap buttons — align with HUD portraits
    // Logical HUD portraits: portraitSize=80, startX = W-40 - 240 - 28 = 1612, py=40
    // Convert that logical rect to client coords for touch hit-test.
    const logicalToClient = (lx, ly) => ({
      x: lx * this.scale + this.offsetX,
      y: ly * this.scale + this.offsetY,
    });
    const pSize = 80, pGap = 14;
    const pStartXLogical = CONFIG.LOGICAL_WIDTH - 40 - pSize * 3 - pGap * 2;
    const pYLogical = 40;
    const sw = [];
    for (let i = 0; i < 3; i++) {
      const lx = pStartXLogical + i * (pSize + pGap);
      const tl = logicalToClient(lx, pYLogical);
      const br = logicalToClient(lx + pSize, pYLogical + pSize);
      sw.push({
        id: `sw${i+1}`,
        action: `switch${i+1}`,
        x: tl.x, y: tl.y,
        w: br.x - tl.x, h: br.y - tl.y,
        shape: 'circle',
      });
    }

    const buttons = [
      { id: 'left',  action: 'left',
        x: leftX, y: dpadY,
        w: dpadSize, h: dpadSize, shape: 'circle' },
      { id: 'right', action: 'right',
        x: rightX, y: dpadY,
        w: dpadSize, h: dpadSize, shape: 'circle' },

      { id: 'jump',  action: 'jump',
        x: jumpX, y: jumpY,
        w: jumpSize, h: jumpSize, shape: 'circle' },
      { id: 'skill', action: 'skill',
        x: skillX, y: skillY,
        w: skillSize, h: skillSize, shape: 'circle' },

      ...sw,
    ];

    Input.setTouchButtons(buttons);
    this._drawTouchOverlay = true;
  }
}

// Bootstrap
const game = new Game();
window.__game = game; // for debugging
game.boot();
