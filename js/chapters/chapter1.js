// Three Little Wings — Chapter 1: Bìa Rừng (tutorial)
//
// Structure: static layout + timeline-scripted events.
// Keeps kịch bản in data form — easy to tune without touching engine.

import { CONFIG } from '../config.js';

export const CHAPTER_1 = {
  number: 1,
  id: 'ch1',
  title: 'Bìa Rừng',
  background: 'bg_ch1_biaurng',
  bgm: 'bgm_ch1_forest',  // file optional
  worldWidth: 3840,       // 2 screens wide
  groundY: CONFIG.GROUND_Y,

  spawn: { x: 280, leader: 'choe' },

  // Platforms for tiny jumping practice
  platforms: [
    { x: 1350, y: 820, w: 260, h: 30 },
    { x: 1720, y: 740, w: 200, h: 30 },
    { x: 2050, y: 820, w: 260, h: 30 },
  ],

  // 3 flowers to collect (not stars — per script)
  collectibles: [
    { type: 'flower',     x: 1820, y: 640 },   // above floating platform
    { type: 'starflower', x: 2600, y: 820 },
    { type: 'flower',     x: 3350, y: 830 },
  ],

  triggers: [
    // Intro cutscene at start
    {
      id: 'intro',
      type: 'onEnter',
      x: 0,
      once: true,
      event: 'intro_scene',
    },
    // Tutorial banner after player has had 4 seconds to look around
    {
      id: 'tut_switch',
      type: 'afterDelay',
      delay: 6500,
      once: true,
      event: 'tutorial_switch',
    },
    // Tutorial for jumping — fires when leader reaches just before platforms
    {
      id: 'tut_jump',
      type: 'onEnter',
      x: 1250, w: 60,
      once: true,
      event: 'tutorial_jump',
    },
    // End of chapter cutscene — at right edge
    {
      id: 'ending',
      type: 'onEnter',
      x: 3700, w: 80,
      once: true,
      event: 'ending_scene',
    },
  ],

  events: {
    // ============================================================
    // INTRO: Chiền Chiện chases butterfly, Cúc Cu calls, Chòe follows
    // ============================================================
    intro_scene: [
      { t: 0,     cmd: 'setVignette', alpha: 0.9 },
      { t: 0,     cmd: 'animateVignette', to: 0, speed: 0.3 },
      { t: 0,     cmd: 'freezeInput' },
      { t: 0,     cmd: 'charPose', char: 'choe',  sprite: 'choe_standing_watching' },
      { t: 0,     cmd: 'charPose', char: 'cucu',  sprite: 'cucu_idle_side' },
      { t: 0,     cmd: 'charPose', char: 'chien', sprite: 'chien_wonder_awestruck' },
      { t: 0,     cmd: 'charTeleport', char: 'choe',  x: 280 },
      { t: 0,     cmd: 'charTeleport', char: 'cucu',  x: 400 },
      { t: 0,     cmd: 'charTeleport', char: 'chien', x: 520 },
      { t: 0,     cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,     cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,     cmd: 'faceChar', char: 'chien', dir: 1 },

      // Opening narration
      { t: 600,   cmd: 'narrate', text: 'Một chiều cuối tuần, ba anh em Chích Chòe, Cúc Cu và Chiền Chiện đang chơi ở bìa rừng sau nhà...', duration: 5500, waitForInput: false },

      // Butterfly appears
      { t: 6300,  cmd: 'spawnProp', prop: 'butterfly', id: 'bfly', from: [750, 500], to: [1100, 450], duration: 8000, color: '#4a9fd4' },

      { t: 6500,  cmd: 'charPose', char: 'chien', sprite: 'chien_wonder_awestruck' },
      { t: 6800,  cmd: 'say', char: 'chien', text: 'Ơ! Bướm đẹp quá! Em bắt cho!', duration: 2200, waitForInput: false },

      // Chiền Chiện runs after butterfly
      { t: 9200,  cmd: 'charPose', char: 'chien', sprite: 'chien_chasing_butterfly' },
      { t: 9200,  cmd: 'moveChar', char: 'chien', toX: 900, speed: 'run' },

      // Cúc Cu reacts
      { t: 10300, cmd: 'charPose', char: 'cucu', sprite: 'cucu_calling_worried' },
      { t: 10400, cmd: 'say', char: 'cucu', text: 'Em ơi! Đừng chạy xa!', duration: 2000, waitForInput: false },

      // Cúc Cu runs after
      { t: 12200, cmd: 'charPose', char: 'cucu', sprite: 'cucu_running_calling' },
      { t: 12200, cmd: 'moveChar', char: 'cucu', toX: 800, speed: 'run' },

      // Chích Chòe sighs and follows
      { t: 14000, cmd: 'charPose', char: 'choe', sprite: 'choe_sighing_smile' },
      { t: 14200, cmd: 'say', char: 'choe', text: '...Haizz. Đi, anh đi với các em.', duration: 2500, waitForInput: false },

      // Chòe moves too, catch up positions
      { t: 16500, cmd: 'charState', char: 'choe', state: 'idle' },
      { t: 16500, cmd: 'charState', char: 'cucu', state: 'idle' },
      { t: 16500, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 16500, cmd: 'removeProp', id: 'bfly' },

      // Release control
      { t: 16700, cmd: 'releaseInput' },
      { t: 16800, cmd: 'narrate', text: '💡 Dùng ← → để đi, Space để nhảy. Bấm 1/2/3 để chuyển nhân vật.', duration: 5000, tutorial: true, waitForInput: false },
    ],

    // ============================================================
    // Tutorial: encourage switching characters
    // ============================================================
    tutorial_switch: [
      { t: 0, cmd: 'narrate', text: '💡 Mỗi bé có một sức mạnh riêng. Thử bấm 1, 2, 3 để chuyển nhân vật!', duration: 4500, tutorial: true, waitForInput: false },
    ],

    // ============================================================
    // Tutorial: jumping over platforms
    // ============================================================
    tutorial_jump: [
      { t: 0, cmd: 'narrate', text: '💡 Bấm Space để nhảy. Có bông hoa sáng ở trên kia...', duration: 3500, tutorial: true, waitForInput: false },
    ],

    // ============================================================
    // ENDING: Chòe points the way → "Theo suối đi"
    // ============================================================
    ending_scene: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 3650 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 3540 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 3430 },
      { t: 0,    cmd: 'faceChar', char: 'choe', dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu', dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 0,    cmd: 'cameraTo', x: 2800 },

      { t: 400,  cmd: 'say', char: 'choe',  text: 'Đường về nhà hình như ngược lại rồi...', duration: 2800 },
      { t: 3400, cmd: 'say', char: 'cucu',  text: 'Vậy mình đi đường nào hả anh?', duration: 2600 },

      // Chòe points
      { t: 6200, cmd: 'charPose', char: 'choe', sprite: 'choe_pointing_direction' },
      { t: 6500, cmd: 'say', char: 'choe', text: 'Theo suối đi. Nước chảy về đâu, mình về đó.', duration: 3500 },

      { t: 10500, cmd: 'narrate', text: 'Và thế là hành trình bắt đầu...', duration: 3500, waitForInput: false },
      { t: 14500, cmd: 'animateVignette', to: 1.0, speed: 0.35 },
      { t: 17500, cmd: 'showTransition', title: 'Chương 1 — Bìa Rừng', next: 2 },
    ],
  },
};
