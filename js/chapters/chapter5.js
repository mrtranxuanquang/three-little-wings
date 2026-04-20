// Three Little Wings — Chapter 5: Cánh Đồng Chiều
//
// Không có mechanic mới — đây là chương cảm xúc.
// Ba anh em lần đầu nhìn thấy nhà từ xa, vượt qua cánh đồng
// dưới ánh chiều tà để trở về.
// Emotion: vui mừng, hồi hộp, nhớ nhà, yêu thương nhau.

import { CONFIG } from '../config.js';

export const CHAPTER_5 = {
  number: 5,
  id: 'ch5',
  title: 'Cánh Đồng Chiều',
  background: 'bg_ch5_canhdong',
  bgm: 'bgm_ch5_sunset',
  worldWidth: 3600,
  groundY: CONFIG.GROUND_Y,

  spawn: { x: 200, leader: 'choe' },

  platforms: [
    // Đồng bằng nhẹ nhàng — rolling meadow feel
    { x: 500,  y: 860, w: 220, h: 30 },
    { x: 800,  y: 820, w: 200, h: 30 },
    { x: 1100, y: 860, w: 180, h: 30 },
    { x: 1400, y: 800, w: 200, h: 30 },
    { x: 1700, y: 840, w: 180, h: 30 },

    // Mỏm đá cao — nhìn thấy nhà từ đây
    { x: 2000, y: 720, w: 200, h: 30 },
    { x: 2280, y: 680, w: 180, h: 30 },
    { x: 2560, y: 730, w: 200, h: 30 },
    { x: 2840, y: 800, w: 220, h: 30 },
  ],

  collectibles: [
    { type: 'flower',     x: 880,  y: 720 },
    { type: 'flower',     x: 1480, y: 700 },
    { type: 'starflower', x: 2360, y: 580 },
    { type: 'starflower', x: 2920, y: 700 },
  ],

  triggers: [
    { id: 'intro',      type: 'onEnter', x: 0,    once: true, event: 'intro_ch5' },
    { id: 'see_house',  type: 'onEnter', x: 600,  w: 100, once: true, event: 'cucu_spots_house' },
    { id: 'high_ledge', type: 'onEnter', x: 1900, w: 100, once: true, event: 'choe_boosts_siblings' },
    { id: 'near_home',  type: 'onEnter', x: 3200, w: 100, once: true, event: 'nearly_home' },
    { id: 'ending',     type: 'onEnter', x: 3450, w: 80,  once: true, event: 'ending_ch5' },
  ],

  events: {
    // ============================================================
    // INTRO Ch5: ra khỏi hang, ánh chiều vàng
    // ============================================================
    intro_ch5: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charPose',     char: 'choe',  sprite: 'choe_standing_watching' },
      { t: 0,    cmd: 'charPose',     char: 'cucu',  sprite: 'cucu_idle_side' },
      { t: 0,    cmd: 'charPose',     char: 'chien', sprite: 'chien_idle_side' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 240 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 140 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 360 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },

      { t: 500,  cmd: 'narrate', text: 'Cánh đồng trải dài dưới ánh chiều tà, gió nhẹ thổi qua làm lúa vàng xôn xao...', duration: 5000 },

      { t: 5800, cmd: 'say', char: 'chien', text: 'Trời ơi đẹp quá! Cánh đồng màu vàng hết!', duration: 2500, waitForInput: false },
      { t: 8500, cmd: 'say', char: 'choe',  text: 'Gần nhà rồi. Đi nhanh lên không tối mất.', duration: 2500 },

      { t: 11200, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 11200, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 11200, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 11400, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Cúc Cu nhìn thấy nhà từ xa
    // ============================================================
    cucu_spots_house: [
      { t: 0,    cmd: 'charPose', char: 'cucu', sprite: 'cucu_calling_worried' },
      { t: 0,    cmd: 'say', char: 'cucu', text: 'Anh Chòe! Nhìn kìa! Nhà mình kìa phía xa!', duration: 2800, waitForInput: false },
      { t: 3000, cmd: 'say', char: 'chien', text: 'Đâu đâu? Em không thấy...', duration: 2000, waitForInput: false },
      { t: 5200, cmd: 'say', char: 'choe',  text: 'Cúc Cu nói đúng. Trèo lên cao nhìn sẽ thấy rõ hơn.', duration: 3000, waitForInput: false },
      { t: 8400, cmd: 'charState', char: 'cucu', state: 'idle' },
    ],

    // ============================================================
    // Lên mỏm đá — Chòe nâng hai em lên
    // ============================================================
    choe_boosts_siblings: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charPose', char: 'choe', sprite: 'choe_standing_watching' },
      { t: 300,  cmd: 'say', char: 'choe', text: 'Mỏm đá cao quá. Anh nâng hai em lên trước nhé.', duration: 3000 },

      // Cúc Cu và Chiền Chiện teleport lên cao
      { t: 3500, cmd: 'charTeleport', char: 'cucu',  x: 2050, y: 720 },
      { t: 3500, cmd: 'charTeleport', char: 'chien', x: 2100, y: 720 },
      { t: 3500, cmd: 'faceChar', char: 'cucu',  dir: -1 },
      { t: 3500, cmd: 'faceChar', char: 'chien', dir: -1 },

      { t: 3800, cmd: 'say', char: 'chien', text: 'Cảm ơn anh Chòe!', duration: 1800, waitForInput: false },

      { t: 5800, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 5800, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 5800, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 5800, cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 5800, cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 5800, cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 6000, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Gần về nhà — chạy nhanh hơn
    // ============================================================
    nearly_home: [
      { t: 0,    cmd: 'say', char: 'chien', text: 'Nhà rồi! Nhà rồi! Em chạy trước nhé!', duration: 2200, waitForInput: false },
      { t: 2400, cmd: 'say', char: 'cucu',  text: 'Đợi em với!', duration: 1600, waitForInput: false },
      { t: 4200, cmd: 'say', char: 'choe',  text: 'Chạy thôi!', duration: 1400, waitForInput: false },
    ],

    // ============================================================
    // ENDING Ch5: trước cửa nhà
    // ============================================================
    ending_ch5: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 3540 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 3420 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 3660 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'chien', state: 'idle' },

      { t: 500,  cmd: 'say', char: 'chien', text: 'Hú hú! Về đến nơi rồi!', duration: 2200 },
      { t: 2900, cmd: 'say', char: 'cucu',  text: 'Hành trình dài thiệt... mà vui ghê!', duration: 2800 },
      { t: 5900, cmd: 'say', char: 'choe',  text: 'Nhờ có nhau cả mới về được. Anh tự hào về hai em lắm.', duration: 3200 },
      { t: 9300, cmd: 'narrate', text: 'Cánh đồng phía sau dần tối. Trước mặt là ánh đèn vàng ấm áp của nhà...', duration: 4200, waitForInput: true },
      { t: 14200, cmd: 'showTransition', title: 'Chương 5 — Cánh Đồng Chiều', next: 6 },
    ],
  },
};
