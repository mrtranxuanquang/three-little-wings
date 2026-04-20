// Three Little Wings — Chapter 8: Về Nhà
//
// Bình minh. Trời sáng rồi. Nhà mình kìa!
// Run home — chạy qua tất cả những nơi đã đi.
// Bố Quang đứng trước cửa, quỳ xuống mở rộng 2 tay.
// Một câu duy nhất bằng giọng thật của bố. Credits.

import { CONFIG } from '../config.js';

export const CHAPTER_8 = {
  number: 8,
  id: 'ch8',
  title: 'Về Nhà',
  background: 'bg_ch8_venha',
  bgm: 'bgm_ch8_venha',
  worldWidth: 3200,
  groundY: CONFIG.GROUND_Y,

  spawn: { x: 200, leader: 'chien' },

  platforms: [],

  npcs: [
    { id: 'bo', x: 2950, facing: -1 },
  ],

  collectibles: [],

  triggers: [
    { id: 'intro',   type: 'onEnter', x: 0,    once: true, event: 'intro_ch8' },
    { id: 'run',     type: 'onEnter', x: 620,  w: 80, once: true, event: 'run_home' },
    { id: 'arrival', type: 'onEnter', x: 2750, w: 100, once: true, event: 'arrive_home' },
  ],

  events: {
    // ============================================================
    // INTRO Ch8: bình minh, 3 bé tỉnh dậy
    // ============================================================
    intro_ch8: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 280 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 180 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 310 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'charPose', char: 'choe',  sprite: 'choe_against_tree' },
      { t: 0,    cmd: 'charPose', char: 'cucu',  sprite: 'cucu_by_fire_warm' },
      { t: 0,    cmd: 'charPose', char: 'chien', sprite: 'chien_yawning_sleepy' },
      { t: 0,    cmd: 'setVignette', alpha: 0.9 },
      { t: 0,    cmd: 'animateVignette', to: 0, speed: 0.2 },

      { t: 1500, cmd: 'narrate', text: 'Tiếng chim hót... Ánh sáng vàng của bình minh xuyên qua tán cây...', duration: 5000, waitForInput: false },

      { t: 5500, cmd: 'charPose', char: 'chien', sprite: 'chien_wonder_awestruck' },
      { t: 5800, cmd: 'say', char: 'chien', text: 'Anh ơi! Anh ơi! Trời sáng rồi!', duration: 2500, waitForInput: false },
      { t: 8500, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 8500, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 8500, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 8800, cmd: 'say', char: 'cucu',  text: 'Nhà mình! Nhà mình kìa!', duration: 2500, waitForInput: false },

      { t: 11600, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 11600, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 11600, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 11600, cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 11600, cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 11600, cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 11800, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Chạy về nhà — music swells
    // ============================================================
    run_home: [
      { t: 0,   cmd: 'sfx', sfx: 'sfx_birds_morning' },
      { t: 0,   cmd: 'narrate', text: 'Ba anh em cùng chạy về nhà. Không có thoại. Chỉ có tiếng chim và gió.', duration: 4500, waitForInput: false },
    ],

    // ============================================================
    // Đến nhà — Bố đang đứng chờ
    // ============================================================
    arrive_home: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 2820 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 2720 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 2920 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 0,    cmd: 'charPose', char: 'bo', sprite: 'bo_kneeling_arms_open' },

      // Bố không nói một lời — chỉ quỳ xuống, mở rộng 2 tay
      { t: 800,  cmd: 'narrate', text: 'Bố thấy 3 con. Không nói một lời. Bố quỳ xuống. Mở rộng 2 tay.', duration: 4500, waitForInput: false },

      // 3 bé lao vào ôm bố
      { t: 5500, cmd: 'attachChars', child: 'chien', parent: 'bo' },
      { t: 5500, cmd: 'attachChars', child: 'cucu',  parent: 'bo' },
      { t: 5500, cmd: 'attachChars', child: 'choe',  parent: 'bo' },
      { t: 5500, cmd: 'charPose', char: 'bo',    sprite: 'bo_hands_clasped_emotional' },
      { t: 5500, cmd: 'charPose', char: 'chien', sprite: 'chien_clinging_scared' },
      { t: 5500, cmd: 'charPose', char: 'cucu',  sprite: 'cucu_arm_around_shoulder' },
      { t: 5500, cmd: 'charPose', char: 'choe',  sprite: 'choe_relieved_kneeling' },

      // 5 giây im lặng. Không có thoại. Music dịu xuống.
      { t: 11000, cmd: 'narrate', text: '...', duration: 2000, waitForInput: false },

      // Giọng thật của Bố Quang — câu duy nhất
      { t: 14000, cmd: 'sfx', sfx: 'sfx_bo_voice' },
      { t: 14000, cmd: 'say', char: 'bo', text: '"Về nhà rồi. Bố rất tự hào vì các con đã đoàn kết, bảo vệ và yêu thương nhau."', duration: 6500, waitForInput: false },

      // 3 bé nhìn bố — rồi mỉm cười
      { t: 21200, cmd: 'charPose', char: 'chien', sprite: 'chien_wonder_awestruck' },
      { t: 21200, cmd: 'charPose', char: 'cucu',  sprite: 'cucu_by_fire_warm' },
      { t: 21200, cmd: 'charPose', char: 'choe',  sprite: 'choe_sighing_smile' },

      // Fade to white
      { t: 24500, cmd: 'animateVignette', to: 1.0, speed: 0.4 },

      // Chữ "Anh em phải bảo vệ và yêu thương nhau..."
      { t: 26800, cmd: 'narrate', text: 'Anh em phải bảo vệ và yêu thương nhau...', duration: 6000, waitForInput: false },

      // Sang Credits
      { t: 34000, cmd: 'goToCredits' },
    ],
  },
};
