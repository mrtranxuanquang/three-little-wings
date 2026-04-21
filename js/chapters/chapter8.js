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

  spawn: { x: 640, leader: 'chien' },

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
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 640 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 525 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 760 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'charPose', char: 'choe',  sprite: 'choe_against_tree' },
      { t: 0,    cmd: 'charPose', char: 'cucu',  sprite: 'cucu_by_fire_warm' },
      { t: 0,    cmd: 'charPose', char: 'chien', sprite: 'chien_yawning_sleepy' },
      { t: 0,    cmd: 'charPose', char: 'bo',    sprite: 'bo_standing_waiting' },
      { t: 0,    cmd: 'setVignette', alpha: 0.9 },
      { t: 0,    cmd: 'animateVignette', to: 0, speed: 0.2 },

      { t: 1500, cmd: 'narrate', text: 'Tiếng chim hót... Ánh sáng vàng của bình minh xuyên qua tán cây... Ba anh em từ từ mở mắt. Chiền Chiện tỉnh trước, nhìn xung quanh rồi lay hai anh...', duration: 8000, waitForInput: false },

      { t: 5500, cmd: 'charPose', char: 'chien', sprite: 'chien_wonder_awestruck' },
      { t: 5800, cmd: 'say', char: 'chien', text: 'Chòe!!! Cu!!! Trời sáng rồi!', duration: 2500, waitForInput: false },
      { t: 8500, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 8500, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 8500, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 8800, cmd: 'say', char: 'cucu',  text: 'Nhà mình! Nhà mình ở phía xa kìa!', duration: 2500, waitForInput: false },

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
      { t: 0,   cmd: 'narrate', text: 'Thấp thoảng tít đằng xa là cột ống khói bốc lên... Ba anh em cùng chạy thật nhanh về phía trước.', duration: 5000, waitForInput: false },
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
      { t: 800,  cmd: 'narrate', text: 'Ra khỏi rừng... Băng qua cánh đồng hoa... Chúng nhảy qua suối... Và thấy cổng nhà...', duration: 6000, waitForInput: false },

      // 3 bé lao vào ôm bố — khoảnh khắc chạm tay
      { t: 5500, cmd: 'attachChars', child: 'chien', parent: 'bo' },
      { t: 5500, cmd: 'attachChars', child: 'cucu',  parent: 'bo' },
      { t: 5500, cmd: 'attachChars', child: 'choe',  parent: 'bo' },

      // ~1 giây sau khi chạm → thay 4 sprites riêng bằng 1 sprite duy nhất
      { t: 6500, cmd: 'charTeleport', char: 'bo', x: 2810 },   // căn giữa sprite nhóm
      { t: 6500, cmd: 'charPose', char: 'bo', sprite: 'bo_scene_father_hugging_all' },
      { t: 6500, cmd: 'hideChar', char: 'choe' },
      { t: 6500, cmd: 'hideChar', char: 'cucu' },
      { t: 6500, cmd: 'hideChar', char: 'chien' },

      // Im lặng — chỉ có sprite ôm nhau
      { t: 9000, cmd: 'narrate', text: '...', duration: 2500, waitForInput: false },

      // Giọng thật của Bố Quang — câu duy nhất (t:12500 → còn 22s trước khi credits)
      { t: 12500, cmd: 'sfx', sfx: 'sfx_bo_voice' },
      { t: 12500, cmd: 'say', char: 'bo', text: '"Về nhà rồi. Bố rất tự hào vì các con đã đoàn kết, bảo vệ và yêu thương nhau."', duration: 6500, waitForInput: false },

      // Fade to white (t:21000 → 14.5s sau sprite nhóm ✓)
      { t: 21000, cmd: 'animateVignette', to: 1.0, speed: 0.4 },

      // BGM fade ra trong lúc màn trắng — giọng bố sẽ nghe rõ hơn
      { t: 22000, cmd: 'stopBgm', fadeMs: 1800 },

      // Chữ + giọng bố Quang cất lên CÙNG LÚC (t:23500)
      // Ghi âm "Anh em phải bảo vệ và yêu thương nhau..." dài 4.2s
      { t: 23500, cmd: 'narrate', text: '"Anh em phải bảo vệ và yêu thương nhau..."', duration: 8000, waitForInput: false },
      { t: 23500, cmd: 'voice', sfx: 'sfx_bao_ve_yeu_thuong' },

      // Credits sau khi giọng kết thúc + khoảng lặng (23500 + 4200 + 4300 buffer = ~32000)
      // t:34500 → 28s sau group sprite, 11s sau giọng đọc ✓
      { t: 34500, cmd: 'goToCredits' },
    ],
  },
};
