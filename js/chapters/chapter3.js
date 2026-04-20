// Three Little Wings — Chapter 3: Rừng Hoa
//
// Skill: Cúc Cu có double-jump (bấm Space hai lần) → nhảy lên cao
// hái hoa chỉ đường giúp ba anh em tìm lối ra khỏi rừng hoa.
// Emotion: Chiền Chiện mê mẩn hoa, Chòe kiên nhẫn dẫn dắt,
//           Cúc Cu tự tin dùng sức mạnh riêng của mình.

import { CONFIG } from '../config.js';

export const CHAPTER_3 = {
  number: 3,
  id: 'ch3',
  title: 'Rừng Hoa',
  background: 'bg_ch3_runghoa',
  bgm: 'bgm_ch3_flowers',
  worldWidth: 4200,
  groundY: CONFIG.GROUND_Y,

  spawn: { x: 200, leader: 'cucu' },

  // Mixed heights: low (single-jump) → high (double-jump needed)
  platforms: [
    // Warm-up — single jump comfortable
    { x: 680,  y: 820, w: 220, h: 30 },
    { x: 1020, y: 780, w: 180, h: 30 },

    // High section — Cúc Cu cần double-jump
    { x: 1340, y: 680, w: 180, h: 30 },
    { x: 1600, y: 640, w: 160, h: 30 },   // đỉnh: starflower ở đây
    { x: 1880, y: 700, w: 180, h: 30 },

    // Xuống dần
    { x: 2180, y: 800, w: 200, h: 30 },
    { x: 2480, y: 820, w: 220, h: 30 },

    // Đoạn cuối rừng
    { x: 2900, y: 760, w: 160, h: 30 },
    { x: 3200, y: 800, w: 200, h: 30 },
  ],

  collectibles: [
    { type: 'flower',     x: 780,  y: 720 },   // trên đầu nền tảng đầu
    { type: 'starflower', x: 1680, y: 540 },   // đỉnh cao nhất — cần double-jump
    { type: 'flower',     x: 2560, y: 720 },   // mid-section
    { type: 'starflower', x: 3280, y: 700 },   // gần lối ra
  ],

  triggers: [
    { id: 'intro',         type: 'onEnter', x: 0,    once: true, event: 'intro_ch3' },
    { id: 'tut_jump2',     type: 'onEnter', x: 600,  w: 100, once: true, event: 'tutorial_double_jump' },
    { id: 'cucu_spots',    type: 'onEnter', x: 1280, w: 100, once: true, event: 'cucu_spots_path' },
    { id: 'near_exit',     type: 'onEnter', x: 3150, w: 100, once: true, event: 'near_exit_comment' },
    { id: 'ending',        type: 'onEnter', x: 3800, w: 80,  once: true, event: 'ending_ch3' },
  ],

  events: {
    // ============================================================
    // INTRO Ch3: vào rừng hoa
    // ============================================================
    intro_ch3: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charPose',    char: 'cucu',  sprite: 'cucu_idle_side' },
      { t: 0,    cmd: 'charPose',    char: 'choe',  sprite: 'choe_standing_watching' },
      { t: 0,    cmd: 'charPose',    char: 'chien', sprite: 'chien_wonder_awestruck' },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 240 },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 140 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 360 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },

      { t: 500,  cmd: 'narrate', text: 'Rừng hoa trải dài trước mắt, hương thơm ngào ngạt. Nhưng mọi lối đi nhìn đâu cũng giống nhau...', duration: 5000 },

      { t: 6000, cmd: 'say', char: 'chien', text: 'Ôi đẹp quá! Hoa ở khắp nơi luôn anh ơi!', duration: 2500, waitForInput: false },
      { t: 8700, cmd: 'say', char: 'choe',  text: 'Đẹp thật — nhưng mình đang lạc đường rồi đây.', duration: 2800 },
      { t: 11700, cmd: 'say', char: 'cucu', text: 'Để em leo lên cao nhìn thử! Em nhảy cao mà!', duration: 2500 },

      { t: 14400, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 14400, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 14400, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 14600, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Tutorial: double-jump
    // ============================================================
    tutorial_double_jump: [
      { t: 0, cmd: 'narrate', text: '💡 Cúc Cu có thể nhảy hai lần! Nhảy lên rồi bấm Space thêm lần nữa để lên cao hơn!', duration: 5500, tutorial: true, waitForInput: false },
    ],

    // ============================================================
    // Cúc Cu nhận ra cần nhìn từ trên cao
    // ============================================================
    cucu_spots_path: [
      { t: 0,    cmd: 'say', char: 'choe', text: 'Cúc Cu, nhảy lên hái bông hoa sáng kia — nó chỉ đường đó!', duration: 3200, waitForInput: false },
      { t: 3400, cmd: 'say', char: 'cucu', text: 'Ừ! Anh tin em đi!', duration: 1800, waitForInput: false },
    ],

    // ============================================================
    // Gần lối ra: Chiền Chiện thấy ánh sáng
    // ============================================================
    near_exit_comment: [
      { t: 0,   cmd: 'say', char: 'chien', text: 'Cuối rừng rồi! Em thấy ánh sáng kìa!', duration: 2500, waitForInput: false },
      { t: 2700, cmd: 'say', char: 'cucu', text: 'Đúng rồi, mình sắp ra khỏi rừng hoa rồi!', duration: 2500, waitForInput: false },
    ],

    // ============================================================
    // ENDING Ch3: ra khỏi rừng hoa
    // ============================================================
    ending_ch3: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 3860 },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 3750 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 3960 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'chien', state: 'idle' },

      { t: 500,  cmd: 'say', char: 'chien', text: 'Ra rồi! Em hít thở được rồi... hoa thơm quá mũi em!', duration: 2800 },
      { t: 3500, cmd: 'say', char: 'cucu',  text: 'Nhờ hoa chỉ đường mình mới ra được. Cảm ơn rừng hoa!', duration: 2800 },
      { t: 6500, cmd: 'charPose', char: 'choe', sprite: 'choe_pointing_direction' },
      { t: 6700, cmd: 'say', char: 'choe',  text: 'Giỏi lắm Cúc Cu. Phía trước là vùng núi — Chòe dẫn đường tiếp.', duration: 3500 },

      { t: 10400, cmd: 'narrate', text: 'Ba anh em bước ra khỏi rừng hoa, lòng nhẹ bẫng như cánh hoa bay...', duration: 4000, waitForInput: true },

      { t: 15000, cmd: 'showTransition', title: 'Chương 3 — Rừng Hoa', next: 4 },
    ],
  },
};
