// Three Little Wings — Chapter 6: Về Nhà
//
// Ba anh em về đến nhà, gặp Bố Quang đang đứng chờ trước cửa.
// Đây là chương cảm xúc nhất — đoàn tụ gia đình.
// Bố Quang lần đầu xuất hiện trong game như một NPC.

import { CONFIG } from '../config.js';

export const CHAPTER_6 = {
  number: 6,
  id: 'ch6',
  title: 'Về Nhà',
  background: 'bg_ch6_venhà',
  bgm: 'bgm_ch6_home',
  worldWidth: 2400,
  groundY: CONFIG.GROUND_Y,

  spawn: { x: 180, leader: 'choe' },

  // Đường về nhà — ngắn, nhẹ nhàng
  platforms: [
    { x: 480,  y: 860, w: 200, h: 30 },
    { x: 780,  y: 840, w: 180, h: 30 },
    { x: 1160, y: 860, w: 200, h: 30 },
  ],

  // Bố Quang đứng chờ trước cửa nhà
  npcs: [
    { id: 'bo', x: 2100, facing: -1 },
  ],

  collectibles: [
    { type: 'flower', x: 560,  y: 760 },
    { type: 'flower', x: 1240, y: 760 },
  ],

  triggers: [
    { id: 'intro',      type: 'onEnter', x: 0,    once: true, event: 'intro_ch6' },
    { id: 'bo_appears', type: 'onEnter', x: 900,  w: 100, once: true, event: 'bo_calls_out' },
    { id: 'reunion',    type: 'onEnter', x: 1700, w: 100, once: true, event: 'reunion_scene' },
    { id: 'ending',     type: 'onEnter', x: 2200, w: 80,  once: true, event: 'ending_ch6' },
  ],

  events: {
    // ============================================================
    // INTRO Ch6: bước vào sân nhà
    // ============================================================
    intro_ch6: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charPose',     char: 'choe',  sprite: 'choe_standing_watching' },
      { t: 0,    cmd: 'charPose',     char: 'cucu',  sprite: 'cucu_idle_side' },
      { t: 0,    cmd: 'charPose',     char: 'chien', sprite: 'chien_wonder_awestruck' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 220 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 130 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 330 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },

      { t: 500,  cmd: 'narrate', text: 'Cánh cổng nhà quen thuộc hiện ra. Tim ba anh em đập thình thịch...', duration: 4500 },
      { t: 5300, cmd: 'say', char: 'chien', text: 'Nhà mình rồi thiệt rồi! Em nhớ cái cổng này!', duration: 2500, waitForInput: false },
      { t: 8000, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 8000, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 8000, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 8200, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Bố Quang nhìn thấy và gọi ra
    // ============================================================
    bo_calls_out: [
      { t: 0,   cmd: 'say', char: 'bo', text: 'Chích Chòe! Cúc Cu! Chiền Chiện! Các con về rồi!', duration: 3500, waitForInput: false },
      { t: 3800, cmd: 'say', char: 'chien', text: 'Bố ơi!!!', duration: 1500, waitForInput: false },
      { t: 5500, cmd: 'say', char: 'cucu',  text: 'Bố! Bố! Con về rồi!', duration: 2000, waitForInput: false },
    ],

    // ============================================================
    // Đoàn tụ — ba anh em chạy đến bên Bố
    // ============================================================
    reunion_scene: [
      { t: 0,    cmd: 'freezeInput' },

      // Ba anh em chạy đến
      { t: 0,    cmd: 'moveChar', char: 'choe',  toX: 1980, speed: 'run' },
      { t: 100,  cmd: 'moveChar', char: 'cucu',  toX: 2020, speed: 'run' },
      { t: 200,  cmd: 'moveChar', char: 'chien', toX: 2060, speed: 'run' },

      // Bố bước ra đón
      { t: 0,    cmd: 'moveChar', char: 'bo',    toX: 1920, speed: 'walk' },

      { t: 2800, cmd: 'cameraShake', amount: 4 },

      { t: 3200, cmd: 'say', char: 'bo', text: 'Bố lo lắng quá... Các con có bị thương không?', duration: 3000 },
      { t: 6400, cmd: 'say', char: 'choe', text: 'Không ạ, ba anh em đều ổn. Con xin lỗi Bố.', duration: 2800 },
      { t: 9400, cmd: 'say', char: 'bo',   text: 'Không sao. Bố vui vì các con về an toàn. Kể bố nghe đi — đi đâu mà lâu vậy?', duration: 4000 },
      { t: 13600, cmd: 'say', char: 'chien', text: 'Dài lắm Bố ơi! Có suối, có hang tối, có rừng hoa nữa!', duration: 3000 },
      { t: 16800, cmd: 'say', char: 'bo',   text: 'Thật à! Vào nhà đi, Bố nấu cơm rồi, kể bố nghe từ đầu nhé.', duration: 3500 },

      { t: 20500, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 20500, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 20500, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 20500, cmd: 'charState', char: 'bo',    state: 'idle' },
      { t: 20700, cmd: 'releaseInput' },
    ],

    // ============================================================
    // ENDING Ch6: bước vào nhà
    // ============================================================
    ending_ch6: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 2220 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 2160 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 2280 },
      { t: 0,    cmd: 'charTeleport', char: 'bo',    x: 2320 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'bo',    dir: 1 },

      { t: 500,  cmd: 'narrate', text: 'Bốn cha con bước vào nhà. Ánh đèn vàng ấm, mùi cơm thơm, tiếng cười vang lên...', duration: 5000, waitForInput: true },
      { t: 6200, cmd: 'showTransition', title: 'Chương 6 — Về Nhà', next: 7 },
    ],
  },
};
