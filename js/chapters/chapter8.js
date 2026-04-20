// Three Little Wings — Chapter 8: Ngủ Ngoan
//
// Chương cuối. Ba anh em vào phòng ngủ, đếm sao trước khi ngủ.
// Bố đắp mền, kể chuyện, chúc ngủ ngoan.
// Khi ba ngôi sao được đếm đủ — đèn tắt, mọi thứ yên tĩnh.
// THE END.

import { CONFIG } from '../config.js';

export const CHAPTER_8 = {
  number: 8,
  id: 'ch8',
  title: 'Ngủ Ngoan',
  background: 'bg_ch8_phongngu',
  bgm: 'bgm_ch8_lullaby',
  worldWidth: 1400,
  groundY: CONFIG.GROUND_Y,

  spawn: { x: 140, leader: 'chien' },

  platforms: [],

  npcs: [
    { id: 'bo', x: 1100, facing: -1 },
  ],

  // Ba ngôi sao ngoài cửa sổ — đếm trước khi ngủ
  collectibles: [
    { type: 'starflower', x: 360,  y: 840 },
    { type: 'starflower', x: 660,  y: 840 },
    { type: 'starflower', x: 960,  y: 840 },
  ],

  triggers: [
    { id: 'intro',         type: 'onEnter',   x: 0,   once: true, event: 'intro_ch8' },
    { id: 'by_bed',        type: 'onEnter',   x: 480, w: 120, once: true, event: 'bo_tucks_in' },
    { id: 'stars_counted', type: 'onCollect', count: 3, once: true, event: 'lullaby_goodnight' },
  ],

  events: {
    // ============================================================
    // INTRO Ch8: vào phòng ngủ
    // ============================================================
    intro_ch8: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charPose',     char: 'chien', sprite: 'chien_idle_side' },
      { t: 0,    cmd: 'charPose',     char: 'cucu',  sprite: 'cucu_idle_side' },
      { t: 0,    cmd: 'charPose',     char: 'choe',  sprite: 'choe_standing_watching' },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 160 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 260 },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 360 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },

      { t: 500,  cmd: 'narrate', text: 'Phòng ngủ quen thuộc. Ba tấm chăn nhỏ xếp ngay ngắn, cửa sổ hé mở đón gió đêm mát rượi...', duration: 5000 },
      { t: 5800, cmd: 'say', char: 'chien', text: 'Mệt quá... nhưng hôm nay vui thiệt là vui!', duration: 2800, waitForInput: false },
      { t: 8800, cmd: 'say', char: 'bo',    text: 'Trước khi ngủ, đếm sao đi. Hôm nay bầu trời đẹp lắm.', duration: 3200 },

      { t: 12200, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 12200, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 12200, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 12400, cmd: 'releaseInput' },
      { t: 12600, cmd: 'narrate', text: '💡 Đếm đủ ba ngôi sao rồi đi ngủ nhé!', duration: 3500, tutorial: true, waitForInput: false },
    ],

    // ============================================================
    // Bố đắp mền, chúc ngủ ngoan từng đứa
    // ============================================================
    bo_tucks_in: [
      { t: 0,    cmd: 'say', char: 'bo',    text: 'Nằm xuống đi các con. Hôm nay đi xa về, mệt rồi.', duration: 3000, waitForInput: false },
      { t: 3200, cmd: 'say', char: 'cucu',  text: 'Bố ơi... kể chuyện cho con nghe được không?', duration: 2500, waitForInput: false },
      { t: 5900, cmd: 'say', char: 'bo',    text: 'Được chứ. Đếm sao xong là bố kể.', duration: 2200, waitForInput: false },
    ],

    // ============================================================
    // Ba sao đủ — chúc ngủ ngoan + lullaby + THE END
    // ============================================================
    lullaby_goodnight: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 920 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 1000 },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 1080 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: -1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: -1 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: -1 },
      { t: 0,    cmd: 'faceChar', char: 'bo',    dir: -1 },

      { t: 500,  cmd: 'say', char: 'chien', text: 'Một, hai, ba! Đủ rồi Bố ơi! Kể chuyện đi!', duration: 2800 },
      { t: 3500, cmd: 'say', char: 'bo',    text: 'Ngày xửa ngày xưa, có ba anh em chim nhỏ sống trong khu rừng...', duration: 4000 },
      { t: 7700, cmd: 'say', char: 'cucu',  text: '...Là tụi mình hả Bố?', duration: 2000 },
      { t: 9900, cmd: 'say', char: 'bo',    text: 'Ừ, là tụi con. Ba chú chim nhỏ dũng cảm, yêu thương nhau, và luôn tìm được đường về nhà.', duration: 5000 },

      // Chúc ngủ ngoan
      { t: 15200, cmd: 'say', char: 'chien', text: 'Ngủ ngon anh Chòe! Ngủ ngon anh Cúc Cu!', duration: 2800 },
      { t: 18200, cmd: 'say', char: 'cucu',  text: 'Ngủ ngon Chiền Chiện. Ngủ ngon anh Chòe.', duration: 2500 },
      { t: 20900, cmd: 'say', char: 'choe',  text: 'Ngủ ngon hai em. Ngủ ngon Bố.', duration: 2500 },
      { t: 23600, cmd: 'say', char: 'bo',    text: 'Ngủ ngon các con. Bố yêu các con nhiều lắm.', duration: 3500 },

      // Lời cuối
      { t: 27500, cmd: 'narrate', text: '"Anh em phải luôn yêu thương nhau."', duration: 4000, waitForInput: false },
      { t: 32500, cmd: 'narrate', text: 'Đêm xuống. Tiếng thở đều đều của ba anh em hoà vào tiếng gió nhẹ ngoài cửa sổ...', duration: 5000, waitForInput: true },

      { t: 38500, cmd: 'gameComplete' },
    ],
  },
};
