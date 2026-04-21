// Three Little Wings — Chapter 6: Vách Núi
//
// Chòe cõng Chiền Chiện trèo lên vách núi cao.
// Cúc Cu đứng dưới giữ dây.
// Chòe trượt giữa đường — cánh tay Cúc Cu cứu cả hai.
// Từ đỉnh, lần đầu nhìn thấy ánh đèn nhà từ xa.

import { CONFIG } from '../config.js';

export const CHAPTER_6 = {
  number: 6,
  id: 'ch6',
  title: 'Vách Núi',
  background: 'bg_ch6_vachnui',
  bgm: 'bgm_ch6_vachnui',
  worldWidth: 2800,
  groundY: CONFIG.GROUND_Y,

  spawn: { x: 200, leader: 'choe' },

  // Cúc Cu giữ dây bên dưới — đặt ở chân vách núi, không trèo lên
  cucuBaseX: 320,

  // Climbing ledges — step up from ground to summit
  platforms: [
    { x: 420,  y: 820, w: 200, h: 30 },
    { x: 680,  y: 740, w: 180, h: 30 },
    { x: 940,  y: 660, w: 180, h: 30 },
    { x: 1200, y: 570, w: 200, h: 30 },
    { x: 1480, y: 480, w: 180, h: 30 },
    { x: 1740, y: 390, w: 200, h: 30 },
    { x: 2020, y: 310, w: 220, h: 30 },   // summit
  ],

  collectibles: [],

  triggers: [
    { id: 'intro',     type: 'onEnter', x: 0,    once: true, event: 'intro_ch6' },
    { id: 'slip',      type: 'onEnter', x: 1100, w: 100, once: true, event: 'choe_slips' },
    { id: 'summit',    type: 'onEnter', x: 2000, w: 120, once: true, event: 'reach_summit' },
    { id: 'ending',    type: 'onEnter', x: 2600, w: 100, once: true, event: 'ending_ch6' },
  ],

  events: {
    // ============================================================
    // INTRO Ch6: trước vách núi
    // ============================================================
    intro_ch6: [
      { t: 0,    cmd: 'setVignette', alpha: 0.85 },
      { t: 0,    cmd: 'animateVignette', to: 0, speed: 0.35 },
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 220 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 130 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 320 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'charPose', char: 'choe',  sprite: 'choe_standing_watching' },
      { t: 0,    cmd: 'charPose', char: 'cucu',  sprite: 'cucu_idle_side' },
      { t: 0,    cmd: 'charPose', char: 'chien', sprite: 'chien_clinging_scared' },

      { t: 600,  cmd: 'say', char: 'choe',  text: 'Vách núi dốc thế này... Chiện chắc không trèo được đâu.', duration: 2800 },
      { t: 3800, cmd: 'charPose', char: 'chien', sprite: 'chien_yelling_defiant' },
      { t: 3900, cmd: 'say', char: 'chien', text: 'Em trèo được! Em khỏe mà!', duration: 2000 },
      { t: 6100, cmd: 'charPose', char: 'choe', sprite: 'choe_sighing_smile' },
      { t: 6200, cmd: 'say', char: 'choe',  text: 'Thôi để anh cõng Chiện. Cu đứng giữ và căng dây nhé, rồi anh quay lại dắt Cu sau.', duration: 4000 },
      { t: 9400, cmd: 'charPose', char: 'cucu', sprite: 'cucu_pulling_rope' },
      { t: 9500, cmd: 'say', char: 'cucu',  text: 'OK anh! Em sẽ giữ chắc!', duration: 2000 },

      // Piggyback: chien ẩn vào choe (dùng hình cõng), chỉ còn Cúc Cu và Chòe (cõng Chiền Chiện)
      { t: 11800, cmd: 'piggybackAttach', child: 'chien', parent: 'choe', yOffset: -260 },
      { t: 11800, cmd: 'hideChar', char: 'chien' },        // chien ẩn, thấy qua pose của choe
      { t: 11800, cmd: 'charPose', char: 'choe', sprite: 'choe_climbing' }, // climbing = cõng
      // Cucu giữ nguyên ở chân vách — khóa follower AI
      { t: 11800, cmd: 'lockFollower', char: 'cucu' },
      { t: 11800, cmd: 'charTeleport', char: 'cucu', x: 320 },
      { t: 11800, cmd: 'charPose', char: 'cucu', sprite: 'cucu_pulling_rope' },
      { t: 11800, cmd: 'lockCharSwitch' },
      { t: 11800, cmd: 'setLeader', char: 'choe' },

      { t: 12200, cmd: 'narrate', text: '💡 Chích Chòe cõng Chiền Chiện! Điều khiển Chích Chòe trèo lên vách núi.', duration: 4000, tutorial: true, waitForInput: false },
      { t: 12400, cmd: 'charState', char: 'choe', state: 'idle' },
      { t: 12600, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Giữa vách — Chòe trượt
    // ============================================================
    choe_slips: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charPose', char: 'choe',  sprite: 'choe_slipping' },
      { t: 0,    cmd: 'charPose', char: 'chien', sprite: 'chien_clinging_scared' },
      { t: 0,    cmd: 'cameraShake', amount: 22 },
      { t: 0,    cmd: 'sfx', sfx: 'sfx_rock_land' },

      { t: 600,  cmd: 'say', char: 'cucu',  text: 'CHÒE ƠI, CÓ SAO KHÔNG?!', duration: 2000, waitForInput: false },
      { t: 2600, cmd: 'charPose', char: 'choe',  sprite: 'choe_climbing' },
      { t: 2700, cmd: 'say', char: 'choe',  text: 'Không sao! Anh bị trượt chân thôi.', duration: 2200, waitForInput: false },
      { t: 5000, cmd: 'say', char: 'chien', text: 'Anh Chòe ơi... em sợ... em không dám nhìn...', duration: 3000 },
      { t: 8300, cmd: 'say', char: 'choe',  text: 'Không sao đâu. Có anh và anh Cu ở đây. Chiện cứ mở mắt ra nhìn lên trời đi. Trời đẹp lắm.', duration: 4500 },
      { t: 13100, cmd: 'charPose', char: 'chien', sprite: 'chien_wonder_awestruck' },
      { t: 13200, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 13400, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Đỉnh vách — nhìn thấy nhà từ xa
    // ============================================================
    reach_summit: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'piggybackDetach', child: 'chien' },
      { t: 0,    cmd: 'showChar', char: 'chien' },          // chien hiện ra ở đỉnh núi
      { t: 0,    cmd: 'unlockFollower', char: 'cucu' },     // cucu có thể di chuyển lại
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 2070, y: 310 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 1960, y: 310 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'charPose', char: 'cucu',  sprite: 'cucu_idle_side' },
      { t: 0,    cmd: 'charPose', char: 'chien', sprite: 'chien_wonder_awestruck' },

      { t: 600,  cmd: 'say', char: 'chien', text: 'Cảm ơn Chòe đã cõng Chiện. Giờ Chiện tự đi được rồi...', duration: 3000 },
      { t: 3600, cmd: 'say', char: 'choe',  text: 'Chiện nhẹ hều mà. Với cả có Cu giữ dây nên an toàn hơn.', duration: 3000 },
      { t: 7400, cmd: 'charPose', char: 'cucu', sprite: 'cucu_arms_crossed_listening' },
      { t: 7500, cmd: 'say', char: 'cucu',  text: 'Cu cũng sợ độ cao, mà lúc nãy Cu cố giữ bình tĩnh đi chậm sau Chòe nên vượt qua dễ dàng.', duration: 4500 },

      { t: 10700, cmd: 'say', char: 'chien', text: 'Ơ, kia có phải là nhà mình không?', duration: 2500 },
      { t: 13700, cmd: 'say', char: 'choe',  text: 'Uhm, đúng rồi. Nhưng vẫn còn xa lắm... Anh em mình cùng đi tiếp nào!', duration: 3500 },
      { t: 17500, cmd: 'narrate', text: 'Từ đỉnh vách núi, ba anh em lần đầu thấy ánh đèn nhà xa xa...', duration: 4000, waitForInput: false },

      { t: 21800, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 21800, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 21800, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 21800, cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 21800, cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 21800, cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 21800, cmd: 'unlockCharSwitch' },
      { t: 22000, cmd: 'releaseInput' },
    ],

    // ============================================================
    // ENDING Ch6
    // ============================================================
    ending_ch6: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 2660 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 2560 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 2760 },
      { t: 0,    cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },

      { t: 500,  cmd: 'narrate', text: 'Ba anh em xuống núi. Nhà đã gần hơn... nhưng màn đêm lại buông xuống. Ba anh em tìm thấy một đống lửa nhỏ chưa tàn trong khoảng rừng thưa và quyết định đêm nay ở lại đó. Bầu trời đầy sao...', duration: 9000, waitForInput: false },
      { t: 10000, cmd: 'animateVignette', to: 1.0, speed: 0.35 },
      { t: 13000, cmd: 'showTransition', title: 'Chương 6 — Vách Núi', next: 7 },
    ],
  },
};
