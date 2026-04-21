// Three Little Wings — Chapter 3: Rừng Hoa
//
// Breathing room. Không có kẻ thù, không có nguy hiểm.
// 5 bông hoa đặc biệt phát sáng để thu thập.
// Khoảnh khắc snack dưới bóng cây cổ thụ.
// Rừng trước mặt ngày càng tối dần — báo hiệu cho Ch4.

import { CONFIG } from '../config.js';

export const CHAPTER_3 = {
  number: 3,
  id: 'ch3',
  title: 'Rừng Hoa',
  background: 'bg_ch3_runghoa',
  bgm: 'bgm_ch3_flowers',
  worldWidth: 2600,
  groundY: CONFIG.GROUND_Y,

  spawn: { x: 640, leader: 'choe' },

  platforms: [],

  collectibles: [
    { type: 'flower',     x: 420,  y: CONFIG.GROUND_Y - 80 },
    { type: 'flower',     x: 780,  y: CONFIG.GROUND_Y - 80 },
    { type: 'starflower', x: 1200, y: CONFIG.GROUND_Y - 80 },
    { type: 'flower',     x: 1700, y: CONFIG.GROUND_Y - 80 },
    { type: 'starflower', x: 2200, y: CONFIG.GROUND_Y - 80 },
  ],

  triggers: [
    { id: 'intro',       type: 'onEnter', x: 0,    once: true, event: 'intro_ch3' },
    { id: 'butterfly',   type: 'onEnter', x: 350,  w: 80, once: true, event: 'butterfly_swarm' },
    { id: 'snack',       type: 'onEnter', x: 1050, w: 100, once: true, event: 'snack_scene' },
    { id: 'darkening',   type: 'onEnter', x: 2050, w: 100, once: true, event: 'forest_darkens' },
    { id: 'ending',      type: 'onEnter', x: 2450, w: 80,  once: true, event: 'ending_ch3' },
  ],

  events: {
    // ============================================================
    // INTRO Ch3: vào cánh đồng hoa
    // ============================================================
    intro_ch3: [
      { t: 0,    cmd: 'setVignette', alpha: 0.9 },
      { t: 0,    cmd: 'animateVignette', to: 0, speed: 0.3 },
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charPose',     char: 'chien', sprite: 'chien_wonder_awestruck' },
      { t: 0,    cmd: 'charPose',     char: 'cucu',  sprite: 'cucu_idle_side' },
      { t: 0,    cmd: 'charPose',     char: 'choe',  sprite: 'choe_standing_watching' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 520 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 640 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 760 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },

      { t: 600,  cmd: 'say', char: 'chien', text: 'WOOOW! Đẹp quá các anh ơi!', duration: 2200, waitForInput: false },
      { t: 3000, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 3100, cmd: 'say', char: 'cucu',  text: 'Cả một rừng hoa luôn... em chưa bao giờ đến đây. Chúng mình không bị lạc chứ?', duration: 3500, waitForInput: false },
      { t: 6200, cmd: 'say', char: 'choe',  text: 'Không đâu. Mình đi qua đây rồi sẽ có lối về nhà ở phía trước thôi.', duration: 3500 },

      { t: 9500, cmd: 'narrate', text: 'Cánh đồng hoa trải dài trước mắt, hương thơm ngào ngạt...', duration: 4000, waitForInput: false },
      { t: 9800, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 9800, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 9800, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 10000, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Bướm bay theo
    // ============================================================
    butterfly_swarm: [
      { t: 0,   cmd: 'spawnProp', prop: 'butterfly', id: 'b1', from: [380, 700], to: [600, 500], duration: 6000, color: '#6ad4f5' },
      { t: 400, cmd: 'spawnProp', prop: 'butterfly', id: 'b2', from: [430, 750], to: [700, 450], duration: 5500, color: '#f9a8d4' },
      { t: 800, cmd: 'spawnProp', prop: 'butterfly', id: 'b3', from: [500, 680], to: [550, 420], duration: 7000, color: '#86efac' },
    ],

    // ============================================================
    // Khoảnh khắc snack dưới cây
    // ============================================================
    snack_scene: [
      { t: 0,    cmd: 'freezeInput' },
      // Chien thêm xa về phía phải để kẹo không bị che bởi Cúc Cu khi sprite flip (dir:-1)
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 1100 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 980 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 1360 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: -1 },
      { t: 0,    cmd: 'charPose', char: 'choe',  sprite: 'choe_opening_bag' },
      { t: 0,    cmd: 'charPose', char: 'cucu',  sprite: 'cucu_attentive_listening' },
      { t: 0,    cmd: 'charPose', char: 'chien', sprite: 'chien_offering_candy' },

      { t: 500,  cmd: 'say', char: 'choe',  text: 'Nhưng mà chúng mình ngồi nghỉ chút đã. Anh mang snack theo này.', duration: 3000 },
      { t: 3200, cmd: 'charPose', char: 'cucu', sprite: 'cucu_eating_snack' },
      { t: 3300, cmd: 'say', char: 'cucu',  text: 'Có bánh quy không anh Chòe? Em đói rồi.', duration: 2500 },
      { t: 6000, cmd: 'say', char: 'choe',  text: 'Có chứ. Cho em 2 cái.', duration: 1800 },
      { t: 8000, cmd: 'say', char: 'chien', text: 'Còn em có kẹo mút này! Em chia cho các anh!', duration: 2500 },
      { t: 10700, cmd: 'say', char: 'choe', text: 'Chiện ăn đi, anh ăn snack đây rồi.', duration: 2200 },

      // scale:0.82 để tỉ lệ chiều cao ngồi hợp lý hơn so với 2 anh đứng
      { t: 13200, cmd: 'charPose', char: 'chien', sprite: 'chien_melancholy_sitting', scale: 0.82 },
      { t: 13500, cmd: 'say', char: 'chien', text: 'Anh Chòe ơi... Chừng nào mình mới về được nhà?', duration: 3200, waitForInput: false },
      { t: 17000, cmd: 'charPose', char: 'choe',  sprite: 'choe_standing_watching' },
      { t: 17200, cmd: 'say', char: 'choe',  text: 'Sắp rồi. Anh nghĩ không còn xa lắm đâu.', duration: 3000 },

      { t: 20500, cmd: 'narrate', text: 'Nhưng ánh mắt Chích Chòe nhìn xa xăm, tỏ vẻ không chắc lắm...', duration: 4000, waitForInput: false },

      { t: 24800, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 24800, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 24800, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 24800, cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 24800, cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 24800, cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 25000, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Rừng phía trước tối dần
    // ============================================================
    forest_darkens: [
      { t: 0,    cmd: 'animateVignette', to: 0.25, speed: 0.08 },
      { t: 500,  cmd: 'narrate', text: 'Mặt trời đã xuống thấp. Rừng phía trước tối dần...', duration: 4000, waitForInput: false },
    ],

    // ============================================================
    // ENDING Ch3
    // ============================================================
    ending_ch3: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 2490 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 2380 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 2580 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'chien', state: 'idle' },

      { t: 500,  cmd: 'say', char: 'chien', text: 'Đi hết cánh đồng hoa rồi! Em mỏi chân quá...', duration: 2500 },
      { t: 3700, cmd: 'say', char: 'cucu',  text: 'Chiện cố lên đi. Nhưng mà... phía trước trông... tối tối âm u kiểu gì ấy...', duration: 3500 },
      { t: 6900, cmd: 'charPose', char: 'choe', sprite: 'choe_pointing_direction' },
      { t: 7100, cmd: 'say', char: 'choe',  text: 'Đó là khu rừng sâu mà bố kể đấy. Anh em mình phải đi xuyên qua đó mới về được nhà.', duration: 4000 },

      { t: 10900, cmd: 'narrate', text: 'Ba anh em tiếp tục đi. Rừng trước mặt ngày càng rậm rạp...', duration: 4000, waitForInput: false },
      { t: 11400, cmd: 'animateVignette', to: 1.0, speed: 0.35 },
      { t: 15200, cmd: 'showTransition', title: 'Chương 3 — Rừng Hoa', next: 4 },
    ],
  },
};
