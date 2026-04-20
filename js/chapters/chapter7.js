// Three Little Wings — Chapter 7: Đêm Rừng
//
// HEART MOMENT — VISUAL STORYTELLING. Không có gameplay.
// 3 bé ngồi quanh đống lửa. Đoạn thoại ngắn về nhà.
// 13 shots bằng charPose + campfire prop + tối dần.
// Piano + tiếng rừng đêm. Không có kẻ thù.

import { CONFIG } from '../config.js';

export const CHAPTER_7 = {
  number: 7,
  id: 'ch7',
  title: 'Đêm Rừng',
  background: 'bg_ch7_demrung',
  bgm: 'bgm_ch7_demrung',
  worldWidth: 1920,
  groundY: CONFIG.GROUND_Y,

  spawn: { x: 400, leader: 'choe' },

  platforms: [],

  collectibles: [],

  triggers: [
    { id: 'intro', type: 'onEnter', x: 0, once: true, event: 'campfire_night' },
  ],

  events: {
    // ============================================================
    // CAMPFIRE NIGHT — toàn bộ chương 7
    // ============================================================
    campfire_night: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 760 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 640 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 880 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: -1 },
      { t: 0,    cmd: 'charPose', char: 'choe',  sprite: 'choe_by_fire' },
      { t: 0,    cmd: 'charPose', char: 'cucu',  sprite: 'cucu_by_fire_warm' },
      { t: 0,    cmd: 'charPose', char: 'chien', sprite: 'chien_melancholy_sitting' },
      { t: 0,    cmd: 'spawnProp', prop: 'campfire', id: 'fire1', x: 760 },
      { t: 0,    cmd: 'animateVignette', to: 0.55, speed: 0.15 },
      { t: 0,    cmd: 'cameraTo', x: 0 },

      // ---- Đoạn thoại ----
      { t: 1500, cmd: 'say', char: 'chien', text: 'Anh ơi... em nhớ bố mẹ...', duration: 3000, waitForInput: false },
      { t: 4800, cmd: 'charPose', char: 'cucu',  sprite: 'cucu_arm_around_shoulder' },
      { t: 5000, cmd: 'say', char: 'cucu',  text: 'Đừng khóc, có tụi anh ở đây mà.', duration: 2500, waitForInput: false },
      { t: 8100, cmd: 'say', char: 'choe',  text: 'Các em có nhớ bố hay dặn gì không?', duration: 3000 },
      { t: 11400, cmd: 'say', char: 'cucu',  text: 'Anh em phải bảo vệ và yêu thương nhau...', duration: 3000 },
      { t: 14700, cmd: 'say', char: 'choe',  text: 'Đúng rồi. Vậy nghĩa là... dù chuyện gì xảy ra, ba anh em mình sẽ cùng nhau vượt qua.', duration: 4500 },
      { t: 19500, cmd: 'narrate', text: '...', duration: 2500, waitForInput: false },

      // ---- SHOT 1: Chiền Chiện ngáp ----
      { t: 22500, cmd: 'charPose', char: 'chien', sprite: 'chien_yawning_sleepy' },

      // ---- SHOT 2: Chiền Chiện ngả vào vai Cúc Cu ----
      { t: 25500, cmd: 'charPose', char: 'chien', sprite: 'chien_sleeping_leaning' },
      { t: 25500, cmd: 'charPose', char: 'cucu',  sprite: 'cucu_by_fire_warm' },

      // ---- SHOT 3: Cúc Cu nhìn em ngủ, mỉm cười ----
      { t: 28500, cmd: 'charPose', char: 'cucu',  sprite: 'cucu_arms_crossed_listening' },

      // ---- SHOT 4: Cúc Cu đắp áo/chỉnh mũ cho em ----
      { t: 31000, cmd: 'charPose', char: 'cucu',  sprite: 'cucu_tucking_blanket' },

      // ---- SHOT 5: Cúc Cu chỉnh mũ len, cẩn thận như mẹ ----
      { t: 33500, cmd: 'charPose', char: 'cucu',  sprite: 'cucu_arm_around_shoulder' },

      // ---- SHOT 6: Pan sang Chòe — đang nhìn 2 em ----
      { t: 36000, cmd: 'charPose', char: 'choe',  sprite: 'choe_watching_protective' },
      { t: 36000, cmd: 'faceChar', char: 'choe',  dir: -1 },

      // ---- SHOT 7: Close-up Chòe — một giọt nước mắt ----
      { t: 39000, cmd: 'charPose', char: 'choe',  sprite: 'choe_single_tear_sitting' },

      // ---- SHOT 8: Khoé môi Chòe cong lên — nụ cười buồn ----
      { t: 42000, cmd: 'charPose', char: 'choe',  sprite: 'choe_sighing_smile' },

      // ---- SHOT 9: Chòe đứng dậy, đến ngồi cạnh 2 em ----
      { t: 45000, cmd: 'charTeleport', char: 'choe', x: 690 },
      { t: 45000, cmd: 'charPose', char: 'choe',  sprite: 'choe_by_fire' },
      { t: 45000, cmd: 'faceChar', char: 'choe',  dir: 1 },

      // ---- SHOT 10: Wide shot — 3 bé dựa vào nhau ----
      { t: 48000, cmd: 'charPose', char: 'choe',  sprite: 'choe_against_tree' },
      { t: 48000, cmd: 'charPose', char: 'cucu',  sprite: 'cucu_by_fire_warm' },
      { t: 48000, cmd: 'charPose', char: 'chien', sprite: 'chien_lying_sleeping' },

      // ---- SHOT 11-12: Lửa nhỏ dần, sao trời, zoom out ----
      { t: 51000, cmd: 'animateVignette', to: 0.75, speed: 0.04 },
      { t: 51500, cmd: 'narrate', text: 'Những đốm sáng lửa bay lên hoà vào sao trời...', duration: 5000, waitForInput: false },

      // ---- SHOT 13: Fade to black + transition ----
      { t: 58000, cmd: 'animateVignette', to: 1.0, speed: 0.25 },
      { t: 61500, cmd: 'setVignette', alpha: 0 },
      { t: 62000, cmd: 'showTransition', title: 'Chương 7 — Đêm Rừng', next: 8 },
    ],
  },
};
