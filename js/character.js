// Three Little Wings — Character (player / follower)

import { CONFIG } from './config.js';
import { updateBody, tryJump } from './physics.js';

// State machine labels
export const STATE = {
  IDLE:   'idle',
  WALK:   'walk',
  RUN:    'run',
  JUMP:   'jump',
  LAND:   'land',
  SKILL:  'skill',
  CUSTOM: 'custom', // scripted pose, don't override
};

/**
 * Pose lookup by character id + state. Returns a list of sprite keys
 * that the character cycles through, plus frame duration.
 */
const POSE_TABLE = {
  choe: {
    idle:  { frames: ['choe_idle_side'],                                     dur: 999999 },
    walk:  { frames: ['choe_idle_side', 'choe_walking_side'],                dur: 220 },
    run:   { frames: ['choe_walking_side', 'choe_running_side'],             dur: 130 },
    jump:  { frames: ['choe_jumping'],                                       dur: 999999 },
    land:  { frames: ['choe_landing'],                                       dur: 160 },
    skill: { frames: ['choe_pushing_rock'],                                  dur: 999999 },
  },
  cucu: {
    idle:  { frames: ['cucu_idle_side'],                                     dur: 999999 },
    walk:  { frames: ['cucu_idle_side', 'cucu_walking_side'],                dur: 220 },
    run:   { frames: ['cucu_walking_side', 'cucu_running_side'],             dur: 130 },
    jump:  { frames: ['cucu_double_jump'],                                   dur: 999999 },
    land:  { frames: ['cucu_landing'],                                       dur: 160 },
    skill: { frames: ['cucu_double_jump'],                                   dur: 999999 },
  },
  chien: {
    idle:  { frames: ['chien_idle_side'],                                    dur: 999999 },
    walk:  { frames: ['chien_idle_side', 'chien_walking_side'],              dur: 220 },
    run:   { frames: ['chien_walking_side', 'chien_running_side'],           dur: 130 },
    jump:  { frames: ['chien_jumping'],                                      dur: 999999 },
    land:  { frames: ['chien_jumping'],                                      dur: 160 },
    skill: { frames: ['chien_shrunk_tiny'],                                  dur: 999999 },
  },
};

export class Character {
  constructor(id, x, y, assets) {
    this.id = id;                  // 'choe' | 'cucu' | 'chien' | 'bo'
    this.assets = assets;          // AssetLoader
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;               // 1 = right, -1 = left
    this.onGround = true;
    this.coyoteTimer = 0;
    this.jumpBuffer = 0;
    this.height = CONFIG.CHARACTER_HEIGHTS[id] || 280;
    this.w = this.height * 0.55;   // hitbox width, feet-centered
    this.h = this.height;
    this.state = STATE.IDLE;
    this.stateTimer = 0;
    this.frameTimer = 0;
    this.frameIndex = 0;
    this.customSpriteKey = null;   // when state=custom, which sprite to draw
    this.visible = true;
    this.scale = 1.0;              // for Chiền Chiện shrink skill
    this.tint = null;
    // Idle breath effect
    this.idlePhase = Math.random() * Math.PI * 2;
  }

  /** Transition to a state. Called by game logic. */
  setState(newState, opts = {}) {
    if (this.state === newState && newState !== STATE.CUSTOM) return;
    this.state = newState;
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.stateTimer = 0;
    if (newState === STATE.CUSTOM) this.customSpriteKey = opts.sprite;
  }

  update(dt, input, platforms, isLeader) {
    this.stateTimer += dt;

    // --- Movement logic (only if player-controlled leader) ---
    if (isLeader && input) {
      let moveDir = 0;
      if (input.isDown('left'))  moveDir -= 1;
      if (input.isDown('right')) moveDir += 1;

      // Progressive speed: walk for the first ~0.5s, then ramp into run.
      // Gives a gentler feel for young players during tutorial.
      if (moveDir !== 0) {
        this._moveHoldTimer = (this._moveHoldTimer || 0) + dt;
      } else {
        this._moveHoldTimer = 0;
      }
      const holdRamp = Math.min(1, (this._moveHoldTimer || 0) / 0.45);
      const targetSpeed = CONFIG.WALK_SPEED + (CONFIG.RUN_SPEED - CONFIG.WALK_SPEED) * holdRamp;
      const targetVx = moveDir * targetSpeed;

      // Smooth accel
      const accel = 2400;
      if (Math.abs(targetVx - this.vx) < accel * dt) {
        this.vx = targetVx;
      } else {
        this.vx += Math.sign(targetVx - this.vx) * accel * dt;
      }

      if (moveDir !== 0) this.facing = moveDir;

      // Jump input
      if (input.wasPressed('jump')) this.jumpBuffer = CONFIG.JUMP_BUFFER;
      if (this.jumpBuffer > 0) {
        const hasDouble = this.id === 'cucu';
        const r = tryJump(this, hasDouble);
        if (r.canJump) {
          // consumed
        }
      }
    }

    // Apply physics
    const phys = updateBody(this, platforms, CONFIG.GROUND_Y, dt);

    // State machine: derive from motion (if not in custom/skill)
    if (this.state !== STATE.CUSTOM && this.state !== STATE.SKILL) {
      if (phys.landed) {
        this.setState(STATE.LAND);
      } else if (this.state === STATE.LAND && this.stateTimer > 0.16) {
        this.setState(STATE.IDLE);
      } else if (!this.onGround) {
        this.setState(STATE.JUMP);
      } else if (Math.abs(this.vx) > CONFIG.WALK_SPEED * 1.1) {
        this.setState(STATE.RUN);
      } else if (Math.abs(this.vx) > 20) {
        this.setState(STATE.WALK);
      } else {
        this.setState(STATE.IDLE);
      }
    }

    // Frame animation
    const pose = POSE_TABLE[this.id]?.[this.state];
    if (pose) {
      this.frameTimer += dt * 1000;
      if (this.frameTimer > pose.dur) {
        this.frameTimer = 0;
        this.frameIndex = (this.frameIndex + 1) % pose.frames.length;
      }
    }

    // Idle phase for breathing
    this.idlePhase += dt * 3;
  }

  /** Follower AI: follow a target at a horizontal offset, mirror facing. */
  followUpdate(target, offset, dt, platforms) {
    const desiredX = target.x + offset;
    const dx = desiredX - this.x;
    const dist = Math.abs(dx);

    let moveDir = 0;
    if (dist > 20) moveDir = Math.sign(dx);

    const isFar = dist > 160;
    const maxSpeed = isFar ? CONFIG.RUN_SPEED : CONFIG.WALK_SPEED * CONFIG.FOLLOW_SPEED_BOOST;
    const targetVx = moveDir * maxSpeed;

    const accel = 2400;
    if (Math.abs(targetVx - this.vx) < accel * dt) {
      this.vx = targetVx;
    } else {
      this.vx += Math.sign(targetVx - this.vx) * accel * dt;
    }

    if (moveDir !== 0) this.facing = moveDir;

    // Auto-jump: if leader is significantly above and follower is on ground, jump.
    // This lets followers climb platforms without getting stuck below the leader.
    if (this.onGround && target.y < this.y - 60 && dist < 400) {
      this.vy = CONFIG.JUMP_VELOCITY;
      this.onGround = false;
      this.coyoteTimer = 0;
    }

    const phys = updateBody(this, platforms, CONFIG.GROUND_Y, dt);

    // State
    if (this.state !== STATE.CUSTOM) {
      if (!this.onGround) this.setState(STATE.JUMP);
      else if (phys.landed) this.setState(STATE.LAND);
      else if (this.state === STATE.LAND && this.stateTimer > 0.16) this.setState(STATE.IDLE);
      else if (Math.abs(this.vx) > CONFIG.WALK_SPEED * 1.1) this.setState(STATE.RUN);
      else if (Math.abs(this.vx) > 20) this.setState(STATE.WALK);
      else this.setState(STATE.IDLE);
    }

    const pose = POSE_TABLE[this.id]?.[this.state];
    if (pose) {
      this.frameTimer += dt * 1000;
      if (this.frameTimer > pose.dur) {
        this.frameTimer = 0;
        this.frameIndex = (this.frameIndex + 1) % pose.frames.length;
      }
    }

    this.idlePhase += dt * 3;
    this.stateTimer += dt;
  }

  /** Get the sprite key to draw right now */
  getCurrentSpriteKey() {
    if (this.state === STATE.CUSTOM && this.customSpriteKey) return this.customSpriteKey;
    const pose = POSE_TABLE[this.id]?.[this.state];
    if (!pose) return `${this.id}_idle_side`;
    return pose.frames[this.frameIndex % pose.frames.length];
  }

  /** Draw the character. ctx is already transformed to world->screen. */
  draw(ctx) {
    if (!this.visible) return;
    const key = this.getCurrentSpriteKey();
    const img = this.assets.get(key);

    // Placeholder if sprite is missing — makes the problem obvious
    // instead of the character silently vanishing.
    if (!img) {
      const pw = this.height * 0.55, ph = this.height;
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#c94a42';
      ctx.fillRect(this.x - pw/2, this.y - ph, pw, ph);
      ctx.fillStyle = '#fff';
      ctx.font = '600 16px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('?', this.x, this.y - ph + 8);
      ctx.fillText(this.id, this.x, this.y - ph + 28);
      ctx.fillText('missing', this.x, this.y - ph + 48);
      ctx.fillText(key.split('_').slice(-2).join('_'), this.x, this.y - ph + 68);
      ctx.restore();
      return;
    }
    const anchor = this.assets.getAnchor(key);

    // Scale sprite so its rendered height = this.height
    const scale = (this.height / img.height) * this.scale;
    const w = img.width * scale;
    const h = img.height * scale;

    // Breathing bob (subtle) when idle
    const bob = (this.state === STATE.IDLE)
      ? Math.sin(this.idlePhase) * 1.5
      : 0;

    // Anchor: draw so that (anchor.x * w, anchor.y * h) of image = (this.x, this.y)
    const drawX = this.x - w * anchor[0];
    const drawY = this.y - h * anchor[1] + bob;

    // Ground shadow (simple ellipse under feet)
    if (this.onGround) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y - 6, w * 0.32, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    if (this.facing < 0) {
      // Flip horizontally around drawX + w/2
      ctx.translate(drawX + w / 2, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(img, -w / 2, 0, w, h);
    } else {
      ctx.drawImage(img, drawX, drawY, w, h);
    }
    ctx.restore();
  }
}
