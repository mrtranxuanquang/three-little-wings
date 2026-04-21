// Three Little Wings — Chapter 2: Suối Đá
//
// Skill: Chích Chòe giữ Z để đẩy đá lăn qua suối → cầu đá xuất hiện
// Emotion: Chiền Chiện sợ nước, Cúc Cu dắt tay em qua cầu

import { CONFIG } from '../config.js';

export const CHAPTER_2 = {
  number: 2,
  id: 'ch2',
  title: 'Suối Đá',
  background: 'bg_ch2_suoida',
  bgm: 'bgm_ch2_stream',
  worldWidth: 3200,
  groundY: CONFIG.GROUND_Y,

  spawn: { x: 640, leader: 'choe' },

  platforms: [],

  // Rock bridge: 3 stepping-stones exposed when all 3 boulders are pushed in
  dynamicPlatforms: [
    { id: 'rock_bridge', x: 1040, y: CONFIG.GROUND_Y - 12, w: 340, h: 28, visible: false },
  ],

  collectibles: [
    { type: 'flower',     x: 600,  y: CONFIG.GROUND_Y - 20 },
    { type: 'starflower', x: 1800, y: CONFIG.GROUND_Y - 20 },
    { type: 'flower',     x: 2800, y: CONFIG.GROUND_Y - 20 },
  ],

  triggers: [
    { id: 'intro',      type: 'onEnter', x: 0, once: true, event: 'intro_ch2' },
    { id: 'near_water', type: 'onEnter', x: 540, w: 100, once: true, event: 'chien_sees_water' },
    { id: 'boulder_tut',type: 'onEnter', x: 700, w: 100, once: true, event: 'tut_push_rock' },
    { id: 'after_bridge',type: 'onEnter', x: 1380, w: 100, once: true, event: 'cucu_takes_hand' },
    { id: 'ending',     type: 'onEnter', x: 2800, w: 80, once: true, event: 'ending_ch2' },
  ],

  events: {
    // ============================================================
    // INTRO Ch2: pick up from Ch1 ending
    // ============================================================
    intro_ch2: [
      { t: 0,    cmd: 'setVignette', alpha: 0.9 },
      { t: 0,    cmd: 'animateVignette', to: 0, speed: 0.3 },
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charPose',    char: 'choe',  sprite: 'choe_standing_watching' },
      { t: 0,    cmd: 'charPose',    char: 'cucu',  sprite: 'cucu_idle_side' },
      { t: 0,    cmd: 'charPose',    char: 'chien', sprite: 'chien_idle_side' },
      { t: 0,    cmd: 'faceChar',    char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar',    char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar',    char: 'chien', dir: 1 },
      { t: 500,  cmd: 'narrate', text: 'Ba anh em men theo dòng suối, tiếng nước chảy róc rách vang lên từ phía trước...', duration: 4500, waitForInput: false },
      { t: 5200, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Chiền Chiện thấy suối → sợ
    // ============================================================
    chien_sees_water: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charPose', char: 'chien', sprite: 'chien_hesitant_back' },
      { t: 200,  cmd: 'say', char: 'chien', text: 'Suối... suối này có sâu không anh Chòe? Em sợ không dám lội qua...', duration: 3500 },
      { t: 3200, cmd: 'say', char: 'choe', text: 'Suối... khá sâu, nước lại... lạnh nữa. Để anh nghĩ cách xem...', duration: 3000 },
      { t: 5200, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Tutorial: đẩy đá — 3 tảng đá giống thật, đẩy từng tảng xuống suối
    // ============================================================
    tut_push_rock: [
      // Dựng barrier tại mép suối — 3 bé không được đi vào suối trước khi cầu xuất hiện
      { t: 0,   cmd: 'setRightBarrier', x: 955 },
      // 3 tảng đá xếp hàng, mỗi tảng một kích thước khác nhau (seed khác nhau)
      { t: 0,   cmd: 'spawnProp', prop: 'boulder', id: 'boulder1', x: 780,  triggerX: 1040, triggerEvent: 'rock1_in', sinkDepth: 18 },
      { t: 200, cmd: 'spawnProp', prop: 'boulder', id: 'boulder2', x: 840,  triggerX: 1100, triggerEvent: 'rock2_in', sinkDepth: 12 },
      { t: 400, cmd: 'spawnProp', prop: 'boulder', id: 'boulder3', x: 900,  triggerX: 1160, triggerEvent: 'bridge_appears', sinkDepth: 8 },
      { t: 600, cmd: 'narrate', text: '💡 Chích Chòe khoẻ nhất! Đứng cạnh tảng đá, giữ Z để đẩy từng tảng đá xuống suối làm cầu!', mobileText: '💡 Đứng cạnh tảng đá, giữ nút ⚡ để đẩy từng tảng đá xuống suối!', duration: 5500, tutorial: true, waitForInput: false },
    ],

    // ============================================================
    // Tảng 1 rơi xuống suối — tiếng bùm, nước văng
    // ============================================================
    rock1_in: [
      { t: 0,   cmd: 'cameraShake', amount: 8 },
      { t: 0,   cmd: 'sfx', sfx: 'sfx_rock_land' },
      { t: 300, cmd: 'narrate', text: 'Bùm! Tảng đá đầu tiên rơi xuống suối...', duration: 2000, waitForInput: false },
    ],

    // ============================================================
    // Tảng 2 rơi xuống — suối nước dậy
    // ============================================================
    rock2_in: [
      { t: 0,   cmd: 'cameraShake', amount: 10 },
      { t: 0,   cmd: 'sfx', sfx: 'sfx_rock_land' },
      { t: 300, cmd: 'narrate', text: 'Tảng hai... sắp xong rồi, cố lên Chòe!', duration: 2000, waitForInput: false },
    ],

    // ============================================================
    // Tảng 3 → cầu đá hoàn chỉnh
    // ============================================================
    bridge_appears: [
      { t: 0,    cmd: 'showPlatform', id: 'rock_bridge' },
      { t: 0,    cmd: 'cameraShake', amount: 14 },
      { t: 0,    cmd: 'sfx', sfx: 'sfx_rock_land' },
      { t: 500,  cmd: 'narrate', text: 'RẦMMM! Ba tảng đá lớn chắn ngang suối — Chích Chòe đã làm được!', duration: 3000, waitForInput: false },
      // Dỡ barrier — cầu đã xong, 3 bé được đi qua
      { t: 800,  cmd: 'clearRightBarrier' },
      { t: 3200, cmd: 'say', char: 'choe', text: 'Xong! Mấy tảng đá này làm cầu được rồi. Các em đi qua đi!', duration: 2800, waitForInput: false },
    ],

    // ============================================================
    // Cúc Cu dắt tay Chiền Chiện qua cầu
    // ============================================================
    cucu_takes_hand: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charPose', char: 'cucu', sprite: 'cucu_reaching_hand_out' },
      { t: 300,  cmd: 'say', char: 'cucu', text: 'Chiền Chiện, bám chặt tay anh nào!', duration: 2200 },
      { t: 3000, cmd: 'charPose', char: 'chien', sprite: 'chien_taking_hand_up' },
      { t: 3200, cmd: 'say', char: 'chien', text: 'Okeee... em nắm được tay anh rồi. Cảm ơn anh Cu!', duration: 2800 },
      { t: 6200, cmd: 'attachChars', parent: 'cucu', child: 'chien' },
      { t: 6300, cmd: 'charPose', char: 'cucu', sprite: 'cucu_idle_side' },
      { t: 6300, cmd: 'charPose', char: 'chien', sprite: 'chien_walking_side' },
      { t: 6500, cmd: 'narrate', text: 'Các con biết giúp đỡ nhau, thật là những đứa trẻ ngoan!', duration: 3500, waitForInput: false },
      { t: 10200, cmd: 'releaseInput' },
    ],

    // ============================================================
    // ENDING Ch2: qua cầu xong, detach, tiếp tục hành trình
    // ============================================================
    ending_ch2: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'detachChars', child: 'chien' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 2800 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 2680 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 2560 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 500,  cmd: 'say', char: 'chien', text: 'Em qua được rồi! Không bị ướt tẹo nào cả.', duration: 2500 },
      { t: 2900, cmd: 'say', char: 'cucu',  text: 'Chiện phải ăn nhiều lên cho lớn khỏe đấy. Thế thì lần sau mới lội qua suối được chứ!', duration: 4000 },
      { t: 5600, cmd: 'say', char: 'choe',  text: 'Giỏi lắm các em! Chúng mình đi tiếp nào. Anh nhìn thấy rừng hoa ở phía trước kìa.', duration: 3500 },
      { t: 8000, cmd: 'narrate', text: 'Ba anh em cùng bước tiếp, tiếng suối dần nhỏ lại phía sau...', duration: 3500, waitForInput: false },
      { t: 8500, cmd: 'animateVignette', to: 1.0, speed: 0.35 },
      { t: 12000, cmd: 'showTransition', title: 'Chương 2 — Suối Đá', next: 3 },
    ],
  },
};
