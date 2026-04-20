// Three Little Wings — Chapter 4: Hang Núi
//
// Skill: Chiền Chiện nhỏ bé và không sợ bóng tối → dẫn đường trong hang.
// Mechanic: thu thập 3 viên đá phát sáng (glowstone) → 3 bục đá sáng xuất hiện
//           mở đường qua đoạn hang tối.
// Emotion: Chòe lo lắng, Cúc Cu sợ bóng tối,
//           Chiền Chiện tự tin dùng sức mạnh của riêng mình.

import { CONFIG } from '../config.js';

export const CHAPTER_4 = {
  number: 4,
  id: 'ch4',
  title: 'Hang Núi',
  background: 'bg_ch4_hangnui',
  bgm: 'bgm_ch4_cave',
  worldWidth: 3800,
  groundY: CONFIG.GROUND_Y,

  spawn: { x: 200, leader: 'chien' },

  // Irregular cave platforms
  platforms: [
    // Entry section
    { x: 450,  y: 860, w: 200, h: 30 },
    { x: 740,  y: 820, w: 170, h: 30 },
    { x: 980,  y: 855, w: 200, h: 30 },

    // Crystal hunt — glowstones are above these platforms
    { x: 1240, y: 800, w: 160, h: 30 },
    { x: 1500, y: 840, w: 180, h: 30 },
    { x: 1760, y: 800, w: 160, h: 30 },
    { x: 2000, y: 850, w: 200, h: 30 },

    // After gap — reachable via glowing stepping stones
    { x: 2820, y: 760, w: 200, h: 30 },
    { x: 3100, y: 820, w: 220, h: 30 },
  ],

  // Glowing stepping stones — appear when 3 crystals collected
  dynamicPlatforms: [
    { id: 'glow1', x: 2220, y: 800, w: 140, h: 30, visible: false, color: '#b8e8ff', glow: true },
    { id: 'glow2', x: 2440, y: 760, w: 140, h: 30, visible: false, color: '#b8e8ff', glow: true },
    { id: 'glow3', x: 2650, y: 800, w: 140, h: 30, visible: false, color: '#b8e8ff', glow: true },
  ],

  collectibles: [
    { type: 'flower',     x: 520,  y: 760 },              // welcome flower
    { type: 'starflower', x: 1290, y: 700 },              // glowstone 1
    { type: 'starflower', x: 1840, y: 700 },              // glowstone 2
    { type: 'starflower', x: 2060, y: 750 },              // glowstone 3 → triggers path
  ],

  triggers: [
    { id: 'intro',        type: 'onEnter',   x: 0,    once: true, event: 'intro_ch4' },
    { id: 'tut_crystal',  type: 'onEnter',   x: 500,  w: 100, once: true, event: 'tutorial_crystal' },
    { id: 'choe_worried', type: 'onEnter',   x: 1200, w: 100, once: true, event: 'choe_dark_worried' },
    { id: 'path_open',    type: 'onCollect', count: 3, once: true, event: 'glowstones_appear' },
    { id: 'near_exit',    type: 'onEnter',   x: 3200, w: 100, once: true, event: 'near_exit_ch4' },
    { id: 'ending',       type: 'onEnter',   x: 3700, w: 80,  once: true, event: 'ending_ch4' },
  ],

  events: {
    // ============================================================
    // INTRO Ch4: vào hang núi tối
    // ============================================================
    intro_ch4: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charPose',     char: 'chien', sprite: 'chien_wonder_awestruck' },
      { t: 0,    cmd: 'charPose',     char: 'choe',  sprite: 'choe_standing_watching' },
      { t: 0,    cmd: 'charPose',     char: 'cucu',  sprite: 'cucu_idle_side' },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 240 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 140 },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 360 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },

      { t: 500,  cmd: 'narrate', text: 'Ba anh em bước vào hang núi. Bóng tối dày đặc, chỉ còn tiếng nhỏ giọt của nước đá vọng lại...', duration: 5500 },

      { t: 6200, cmd: 'say', char: 'cucu',  text: 'Tối quá... anh Chòe ơi em không nhìn thấy gì cả!', duration: 2800 },
      { t: 9200, cmd: 'say', char: 'choe',  text: 'Bình tĩnh. Mình cần tìm thứ gì đó để soi đường.', duration: 2800 },
      { t: 12200, cmd: 'say', char: 'chien', text: 'Ơi nhìn kìa! Có đá sáng! Để em dẫn đường cho!', duration: 2800 },

      { t: 15200, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 15200, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 15200, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 15400, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Tutorial: thu thập đá phát sáng
    // ============================================================
    tutorial_crystal: [
      { t: 0, cmd: 'narrate', text: '💡 Thu thập 3 viên đá phát sáng để mở đường qua đoạn hang tối!', duration: 5000, tutorial: true, waitForInput: false },
    ],

    // ============================================================
    // Chòe lo khi vào sâu trong hang
    // ============================================================
    choe_dark_worried: [
      { t: 0,    cmd: 'say', char: 'choe',  text: 'Càng vào sâu càng tối. Chiền Chiện, em thấy đường không?', duration: 3000, waitForInput: false },
      { t: 3200, cmd: 'say', char: 'chien', text: 'Em thấy hết mà anh! Đá sáng đâu là em đi được đó!', duration: 2800, waitForInput: false },
    ],

    // ============================================================
    // 3 glowstones collected → stepping stones xuất hiện
    // ============================================================
    glowstones_appear: [
      { t: 0,    cmd: 'cameraShake', amount: 8 },
      { t: 0,    cmd: 'sfx', sfx: 'sfx_rock_land' },
      { t: 0,    cmd: 'showPlatform', id: 'glow1' },
      { t: 250,  cmd: 'showPlatform', id: 'glow2' },
      { t: 500,  cmd: 'showPlatform', id: 'glow3' },
      { t: 700,  cmd: 'narrate', text: 'Đá phát sáng — những bục đá lấp lánh hiện ra giữa màn tối!', duration: 3000, waitForInput: false },
      { t: 3900, cmd: 'say', char: 'chien', text: 'Đường sáng rồi anh ơi! Đi theo em!', duration: 2200, waitForInput: false },
      { t: 6300, cmd: 'say', char: 'cucu',  text: 'Chiền Chiện giỏi quá! Không có em thì mình lạc rồi!', duration: 2800, waitForInput: false },
    ],

    // ============================================================
    // Thấy ánh sáng cuối hang
    // ============================================================
    near_exit_ch4: [
      { t: 0,    cmd: 'say', char: 'choe',  text: 'Nhìn kìa! Ánh sáng cuối hang rồi!', duration: 2500, waitForInput: false },
      { t: 2700, cmd: 'say', char: 'chien', text: 'Em biết mà! Cứ đi theo em là ra thôi!', duration: 2500, waitForInput: false },
    ],

    // ============================================================
    // ENDING Ch4: ra khỏi hang núi
    // ============================================================
    ending_ch4: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 3730 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 3620 },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 3850 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'choe',  state: 'idle' },

      { t: 500,  cmd: 'say', char: 'choe',  text: 'Chiền Chiện giỏi lắm. Không có em, tối thế này ai dẫn được.', duration: 3200 },
      { t: 3900, cmd: 'say', char: 'chien', text: 'Hehe, em nhỏ nên không sợ chỗ tối! Đó là sức mạnh của em!', duration: 3000 },
      { t: 7100, cmd: 'say', char: 'cucu',  text: 'Ba anh em mình ai cũng có sức mạnh riêng nhỉ!', duration: 2800 },
      { t: 10100, cmd: 'charPose', char: 'choe', sprite: 'choe_pointing_direction' },
      { t: 10300, cmd: 'say', char: 'choe', text: 'Đúng vậy. Phía trước là cánh đồng — gần nhà rồi!', duration: 2800 },

      { t: 13300, cmd: 'narrate', text: 'Ba anh em bước ra khỏi hang núi, ánh nắng chiều ập vào ấm áp...', duration: 4000, waitForInput: true },

      { t: 18000, cmd: 'showTransition', title: 'Chương 4 — Hang Núi', next: 5 },
    ],
  },
};
