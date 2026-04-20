// Three Little Wings — Input manager (unified keyboard + touch)

/**
 * Logical actions — game code only cares about these, not source.
 *   left, right, jump, skill, switch1, switch2, switch3, pause, advance, debug
 *
 * API:
 *   Input.isDown(action)    — currently held
 *   Input.wasPressed(action)— pressed this frame (edge)
 *   Input.consumePressed(a) — same as wasPressed but clears it (for menu navigation)
 *   Input.update()          — call at end of each frame to clear edge events
 */

const ACTIONS = ['left','right','jump','skill','switch1','switch2','switch3','pause','advance','debug'];

// Keyboard mapping
const KEY_MAP = {
  'ArrowLeft': 'left',   'a': 'left',   'A': 'left',
  'ArrowRight': 'right', 'd': 'right',  'D': 'right',
  'ArrowUp': 'jump',     'w': 'jump',   'W': 'jump',   ' ': 'jump',
  'z': 'skill',          'Z': 'skill',  'Shift': 'skill',
  '1': 'switch1',
  '2': 'switch2',
  '3': 'switch3',
  'Escape': 'pause',     'p': 'pause',  'P': 'pause',
  'Enter': 'advance',
  '`': 'debug',          '~': 'debug',
};

class InputManager {
  constructor() {
    this.down = {};       // action -> bool
    this.pressed = {};    // action -> bool (edge: was pressed this frame)
    this.touchButtons = new Map(); // buttonId -> { rect, action }
    this._activeTouches = new Map(); // touchId -> buttonId
    this._installed = false;
  }

  install(canvas) {
    if (this._installed) return;
    this._installed = true;
    this.canvas = canvas;

    // Keyboard
    window.addEventListener('keydown', (e) => {
      const action = KEY_MAP[e.key];
      if (action) {
        if (!this.down[action]) this.pressed[action] = true;
        this.down[action] = true;
        // Prevent arrow scroll
        if (action === 'left' || action === 'right' || action === 'jump') e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      const action = KEY_MAP[e.key];
      if (action) this.down[action] = false;
    });

    // Touch — buttons are set by UI layer via setTouchButtons()
    const handleTouchStart = (e) => {
      let hitAnyButton = false;
      for (const t of e.changedTouches) {
        const btn = this._hitTestTouch(t.clientX, t.clientY);
        if (btn) {
          hitAnyButton = true;
          this._activeTouches.set(t.identifier, btn.id);
          if (!this.down[btn.action]) this.pressed[btn.action] = true;
          this.down[btn.action] = true;
        }
      }
      // If the touch didn't hit any button, treat it as an 'advance' tap
      // (so dialogs/menus can be dismissed/clicked on touch devices).
      if (!hitAnyButton && e.changedTouches.length > 0) {
        if (!this.down.advance) this.pressed.advance = true;
      }
      // Always preventDefault to avoid page scroll/zoom during gameplay
      if (e.cancelable) e.preventDefault();
    };
    const handleTouchEnd = (e) => {
      for (const t of e.changedTouches) {
        const btnId = this._activeTouches.get(t.identifier);
        if (btnId) {
          const btn = this.touchButtons.get(btnId);
          if (btn) {
            // Release if no other touch is on the same button
            let stillHeld = false;
            for (const [tid, bid] of this._activeTouches) {
              if (tid !== t.identifier && bid === btnId) { stillHeld = true; break; }
            }
            if (!stillHeld) this.down[btn.action] = false;
          }
          this._activeTouches.delete(t.identifier);
        }
      }
    };
    const handleTouchMove = (e) => { e.preventDefault(); };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Click (desktop fallback for touch buttons, used for menu)
    canvas.addEventListener('mousedown', (e) => {
      const btn = this._hitTestTouch(e.clientX, e.clientY);
      if (btn) {
        if (!this.down[btn.action]) this.pressed[btn.action] = true;
        this.down[btn.action] = true;
        btn.mouseHeld = true;  // flag so mouseup can release it
      }
    });
    canvas.addEventListener('mouseup', (e) => {
      // Release all mouse-activated touch buttons
      for (const [id, b] of this.touchButtons) {
        if (b.mouseHeld) {
          this.down[b.action] = false;
          b.mouseHeld = false;
        }
      }
    });

    // Click-anywhere for 'advance' (dialogs, menus) — desktop
    canvas.addEventListener('click', (e) => {
      // Don't trigger advance if click was on a touch button
      if (!this._hitTestTouch(e.clientX, e.clientY)) {
        if (!this.down.advance) this.pressed.advance = true;
      }
    });

    // Blur/focus: clear all state to avoid stuck keys
    window.addEventListener('blur', () => this.clearAll());
  }

  /**
   * Register touch buttons. rects are in screen (client) coordinates.
   * Call after viewport resize.
   *   buttons: [{ id, action, x, y, w, h, shape?:'circle' }]
   */
  setTouchButtons(buttons) {
    this.touchButtons.clear();
    for (const b of buttons) this.touchButtons.set(b.id, b);
  }

  _hitTestTouch(x, y) {
    for (const b of this.touchButtons.values()) {
      if (b.shape === 'circle') {
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        const dx = x - cx, dy = y - cy, r = b.w / 2;
        if (dx*dx + dy*dy <= r*r) return b;
      } else {
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
      }
    }
    return null;
  }

  isDown(action)    { return !!this.down[action]; }
  wasPressed(action){ return !!this.pressed[action]; }
  consumePressed(action){
    const v = !!this.pressed[action];
    this.pressed[action] = false;
    return v;
  }

  clearAll() {
    this.down = {};
    this.pressed = {};
  }

  /** Call at end of frame */
  update() {
    this.pressed = {};
  }
}

export const Input = new InputManager();
