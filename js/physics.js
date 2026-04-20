// Three Little Wings — Platformer physics helpers

import { CONFIG } from './config.js';

// Max physics sub-step size (recommended by game-engine skill: fixed timestep principle).
// Prevents fast-falling bodies from tunneling through thin platforms when dt spikes.
const MAX_PHYSICS_STEP = 1 / 60;

/**
 * Update a character body against platforms.
 *  body: { x, y, vx, vy, w, h, onGround, coyoteTimer, jumpBuffer }
 *  platforms: [{x,y,w,h}] — static AABB
 *  groundY: world y where flat ground is
 *
 * Sub-steps when dt > 16ms so collision remains stable at any frame rate.
 */
export function updateBody(body, platforms, groundY, dt) {
  if (dt <= MAX_PHYSICS_STEP) {
    return _step(body, platforms, groundY, dt);
  }

  // Break large dt into fixed-size sub-steps
  let remaining = dt;
  const result = { landed: false };
  while (remaining > 0) {
    const subDt = Math.min(remaining, MAX_PHYSICS_STEP);
    if (_step(body, platforms, groundY, subDt).landed) result.landed = true;
    remaining -= subDt;
  }
  return result;
}

function _step(body, platforms, groundY, dt) {
  // Apply gravity
  body.vy += CONFIG.GRAVITY * dt;

  // Cap fall speed (no ridiculous velocities)
  if (body.vy > 1800) body.vy = 1800;

  // Horizontal move
  body.x += body.vx * dt;

  // Vertical move
  body.y += body.vy * dt;

  // Was on ground?
  const wasOnGround = body.onGround;
  body.onGround = false;

  // Flat ground collision
  if (body.y >= groundY) {
    body.y = groundY;
    body.vy = 0;
    body.onGround = true;
  }

  // Platform collisions (one-way: only from above)
  // Use 80% of body width so edge landings feel accurate but not too forgiving
  if (body.vy >= 0) {
    const halfW = (body.w || 0) * 0.4;
    for (const p of platforms) {
      const feetY = body.y;
      const prevFeetY = feetY - body.vy * dt;
      if (
        body.x + halfW >= p.x && body.x - halfW <= p.x + p.w &&
        prevFeetY <= p.y + 2 && feetY >= p.y && feetY <= p.y + p.h + 8
      ) {
        body.y = p.y;
        body.vy = 0;
        body.onGround = true;
        break;
      }
    }
  }

  // Coyote time: count down if in air
  if (body.onGround) {
    body.coyoteTimer = CONFIG.COYOTE_TIME;
  } else {
    body.coyoteTimer = Math.max(0, (body.coyoteTimer || 0) - dt);
  }

  // Jump buffer: count down
  if (body.jumpBuffer > 0) body.jumpBuffer -= dt;

  return { landed: !wasOnGround && body.onGround };
}

/**
 * Consume the jump buffer & coyote to see if character can jump now.
 * Returns { canJump, usedDouble }
 */
export function tryJump(body, hasDoubleJump) {
  const canSingle = body.onGround || body.coyoteTimer > 0;
  if (canSingle) {
    body.vy = CONFIG.JUMP_VELOCITY;
    body.onGround = false;
    body.coyoteTimer = 0;
    body.jumpBuffer = 0;
    body._usedDouble = false;
    return { canJump: true, usedDouble: false };
  }
  // Double jump (Cúc Cu only)
  if (hasDoubleJump && !body._usedDouble && !body.onGround) {
    body.vy = CONFIG.DOUBLE_JUMP_VELOCITY;
    body._usedDouble = true;
    body.jumpBuffer = 0;
    return { canJump: true, usedDouble: true };
  }
  return { canJump: false, usedDouble: false };
}
