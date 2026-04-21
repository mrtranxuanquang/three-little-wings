// Three Little Wings — Chapter 5: Hang Tối
//
// Chòe sợ bóng tối — lần đầu tiên người chơi thấy anh cả yếu đuối.
// CAVE WALK MODE: giữ SPACE để 3 bé tiếp tục bước.
// Progressive darkness → heartbeat → deer eyes → deer reveal.
// Ra khỏi hang: cánh đồng đom đóm. Chòe cảm ơn 2 em.

import { CONFIG } from '../config.js';

export const CHAPTER_5 = {
  number: 5,
  id: 'ch5',
  title: 'Hang Tối',
  background: 'bg_ch5_hangtoi',
  bgm: 'bgm_ch5_hangtoi',
  worldWidth: 4200,
  groundY: CONFIG.GROUND_Y,

  spawn: { x: 640, leader: 'choe' },

  platforms: [],

  collectibles: [],

  triggers: [
    { id: 'intro',        type: 'onEnter', x: 0,    once: true, event: 'intro_ch5' },
    { id: 'cave_start',   type: 'onEnter', x: 500,  w: 80, once: true, event: 'enter_cave' },
    { id: 'dark_mid',     type: 'onEnter', x: 1400, w: 80, once: true, event: 'cave_dark_mid' },
    { id: 'deer_eyes',    type: 'onEnter', x: 1900, w: 80, once: true, event: 'deer_eyes_appear' },
    { id: 'deer_reveal',  type: 'onEnter', x: 2300, w: 80, once: true, event: 'deer_reveal' },
    { id: 'cave_exit',    type: 'onEnter', x: 2700, w: 80, once: true, event: 'exit_cave' },
    { id: 'firefly_talk', type: 'onEnter', x: 3400, w: 80, once: true, event: 'firefly_field' },
    { id: 'ending',       type: 'onEnter', x: 3900, w: 80, once: true, event: 'ending_ch5' },
  ],

  events: {
    // ============================================================
    // INTRO: 3 bé đứng trước miệng hang
    // ============================================================
    intro_ch5: [
      { t: 0,    cmd: 'setVignette', alpha: 0.85 },
      { t: 0,    cmd: 'animateVignette', to: 0, speed: 0.35 },
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 640 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 525 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 760 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'charPose', char: 'choe',  sprite: 'choe_frozen_fear' },
      { t: 0,    cmd: 'charPose', char: 'cucu',  sprite: 'cucu_attentive_listening' },
      { t: 0,    cmd: 'charPose', char: 'chien', sprite: 'chien_clinging_scared' },

      { t: 500,  cmd: 'narrate', text: 'Trước mặt là một cái hang lớn. Miệng hang đen ngòm. Có gió lạnh từ trong thổi ra... Có một vài tiếng lách cách rất nhỏ từ sâu trong hang.', duration: 7000, waitForInput: false },
      { t: 6300, cmd: 'say', char: 'choe',  text: '...Hình như có gì đó trong đấy.', duration: 2800, waitForInput: false },

      // 2 em nhìn anh cả — rồi tiến đến cầm tay
      { t: 9500, cmd: 'charPose', char: 'cucu',  sprite: 'cucu_reaching_hand_out' },
      { t: 9500, cmd: 'charPose', char: 'chien', sprite: 'chien_taking_hand_up' },
      { t: 9800, cmd: 'attachChars', child: 'cucu',  parent: 'choe' },
      { t: 10000, cmd: 'attachChars', child: 'chien', parent: 'choe' },

      // Không có lời thoại — chỉ có hình ảnh 3 bé nắm tay nhau
      { t: 11000, cmd: 'narrate', text: '...', duration: 3500, waitForInput: false },
      { t: 15500, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 15500, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 15500, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 15700, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Vào hang — bắt đầu cave walk mode
    // ============================================================
    enter_cave: [
      { t: 0,    cmd: 'setCaveWalk', on: true },
      { t: 0,    cmd: 'heartbeat', bpm: 64 },
      { t: 0,    cmd: 'animateVignette', to: 0.15, speed: 0.12 },
      // Heartbeat chỉ 2 giây rồi dừng — liền mạch hơn
      { t: 1200, cmd: 'setHeartbeatBpm', bpm: 88 },
      { t: 2000, cmd: 'stopHeartbeat' },
      { t: 2200, cmd: 'animateVignette', to: 0.72, speed: 0.06 },
      // Mắt nai tự dần xuất hiện và tự di chuyển lại gần — không cần ấn
      { t: 2800, cmd: 'spawnProp', prop: 'deerEyes', id: 'deer1', x: 2800 },
    ],

    // ============================================================
    // Giữa hang — tối hơn
    // ============================================================
    cave_dark_mid: [
      { t: 0,   cmd: 'animateVignette', to: 0.72, speed: 0.06 },
      { t: 0,   cmd: 'setHeartbeatBpm', bpm: 68 },
    ],

    // ============================================================
    // Mắt đỏ xuất hiện ở xa
    // ============================================================
    deer_eyes_appear: [
      // Mắt nai đã xuất hiện từ enter_cave sau 7.5s heartbeat
      { t: 0,   cmd: 'animateVignette', to: 0.88, speed: 0.1 },
      { t: 800, cmd: 'freezeInput' },
      { t: 800, cmd: 'setCaveWalk', on: false },
      { t: 1200, cmd: 'say', char: 'chien', text: 'Có em với anh Cu cũng ở đây mà, sợ gì...', duration: 2800, waitForInput: false },
      { t: 4500, cmd: 'say', char: 'cucu',  text: 'Cu với Chiện không để Chòe một mình đâu. Mình cùng vào.', duration: 3500, waitForInput: false },
      { t: 7700, cmd: 'charPose', char: 'choe', sprite: 'choe_standing_watching' },
      { t: 8500, cmd: 'setCaveWalk', on: true },
      { t: 8500, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Đến gần — HÓA RA LÀ CON NAI
    // ============================================================
    deer_reveal: [
      { t: 0,   cmd: 'setCaveWalk', on: false },
      { t: 0,   cmd: 'freezeInput' },
      { t: 0,   cmd: 'removeProp', id: 'deer1' },
      { t: 0,   cmd: 'stopHeartbeat' },
      { t: 0,   cmd: 'animateVignette', to: 0.3, speed: 0.5 },
      { t: 500, cmd: 'say', char: 'choe',  text: '...Thì ra là một con nai.', duration: 2500, waitForInput: false },
      { t: 3200, cmd: 'bgm', track: 'bgm_ch3_flowers', fadeMs: 2000 },
      { t: 3500, cmd: 'animateVignette', to: 0.05, speed: 0.3 },
      { t: 4500, cmd: 'charPose', char: 'choe',  sprite: 'choe_sighing_smile' },
      { t: 5500, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 5500, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 5500, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 5700, cmd: 'setCaveWalk', on: true },
      { t: 5700, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Ra khỏi hang — tắt cave walk, đổi background đom đóm
    // ============================================================
    exit_cave: [
      { t: 0,   cmd: 'setCaveWalk', on: false },
      { t: 0,   cmd: 'stopHeartbeat' },
      { t: 0,   cmd: 'animateVignette', to: 0, speed: 1.2 },
      { t: 0,   cmd: 'setBg', key: 'bg_ch5_domdom' },
      { t: 0,   cmd: 'bgm', track: 'bgm_ch5_domdom', fadeMs: 2500 },
      { t: 0,   cmd: 'detachChars', child: 'cucu' },
      { t: 0,   cmd: 'detachChars', child: 'chien' },
      { t: 300, cmd: 'spawnProp', prop: 'fireflies', id: 'ff1', count: 40 },
      { t: 300, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 300, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 300, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 500, cmd: 'freezeInput' },
      { t: 800, cmd: 'say', char: 'chien', text: 'WOWWW... Đẹp quuuuuá! Hàng tỉ tỉ con đom đóm này...', duration: 3500, waitForInput: false },
      { t: 3500, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Cánh đồng đom đóm — Chòe chia sẻ cảm xúc
    // ============================================================
    firefly_field: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 3450 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 3340 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 3560 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: -1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: -1 },
      { t: 0,    cmd: 'charPose', char: 'choe',  sprite: 'choe_relieved_kneeling' },
      { t: 0,    cmd: 'charPose', char: 'cucu',  sprite: 'cucu_attentive_listening' },
      { t: 0,    cmd: 'charPose', char: 'chien', sprite: 'chien_wonder_awestruck' },

      { t: 800,  cmd: 'say', char: 'choe',  text: 'Anh xin lỗi vì anh sợ bóng tối nên vừa nãy... Nhưng có hai đứa, anh đỡ sợ hơn nhiều.', duration: 4500 },
      { t: 5000, cmd: 'say', char: 'cucu',  text: 'Ban ngày Chòe bảo vệ Cu với Chiện. Giờ Cu với Chiện sẽ bảo vệ lại Chòe, hihi...', duration: 4000 },
      { t: 8800, cmd: 'narrate', text: 'Đôi khi... chính người lớn nhất cũng cần được bảo vệ.', duration: 4500, waitForInput: false },
      { t: 13700, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 13700, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 13700, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 13700, cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 13700, cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 13700, cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 13900, cmd: 'releaseInput' },
    ],

    // ============================================================
    // ENDING Ch5
    // ============================================================
    ending_ch5: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 3960 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 3850 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 4060 },
      { t: 0,    cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },

      { t: 500,  cmd: 'say', char: 'choe',  text: 'Trời tối rồi. Mình phải ở lại đây nghỉ ngơi rồi mai mới đi tiếp được.', duration: 3500, waitForInput: false },
      { t: 4200, cmd: 'narrate', text: 'Ba anh em nhìn lên trời. Sao đêm bắt đầu mọc. Đom đóm lấp lánh khắp nơi...', duration: 4000, waitForInput: false },
      { t: 8500, cmd: 'animateVignette', to: 1.0, speed: 0.35 },
      { t: 11000, cmd: 'showTransition', title: 'Chương 5 — Hang Tối', next: 6 },
    ],
  },
};
