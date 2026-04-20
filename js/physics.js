// Three Little Wings — Platformer physics helpers

import { CONFIG } from './config.js';

/**
 * Update a character body against platforms.
 *  body: { x, y, vx, vy, w, h, onGround, coyoteTimer, jumpBuffer }
 *  platforms: [{x,y,w,h}] — static AABB
 *  groundY: world y where flat ground is
 */
export function updateBody(body, platforms, groundY, dt) {
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

  // Platform collisions (one-way: only from above, simple)
  // Treat body as a point at feet (body.x, body.y)
  if (body.vy >= 0) {
    for (const p of platforms) {
      const feetY = body.y;
      const prevFeetY = feetY - body.vy * dt;
      if (
        body.x >= p.x && body.x <= p.x + p.w &&
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
