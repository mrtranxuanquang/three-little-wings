// Three Little Wings — Chapter 4: Rừng Sâu
//
// "Em không cần anh nữa!" — Chiền Chiện giận, bỏ chạy vào rừng.
// Người chơi chỉ điều khiển Cúc Cu chạy theo em.
// Cành cây gãy — Cúc Cu lao vào cứu Chiền Chiện.
// Hối hận, ôm nhau, tha thứ. Chòe ôm cả hai.

import { CONFIG } from '../config.js';

export const CHAPTER_4 = {
  number: 4,
  id: 'ch4',
  title: 'Rừng Sâu',
  background: 'bg_ch4_rungsau',
  bgm: 'bgm_ch4_rungsau',
  worldWidth: 2600,
  groundY: CONFIG.GROUND_Y,

  spawn: { x: 200, leader: 'cucu' },

  platforms: [],

  collectibles: [],

  triggers: [
    { id: 'intro',      type: 'onEnter', x: 0,    once: true, event: 'intro_ch4' },
    { id: 'cucu_calls', type: 'onEnter', x: 700,  w: 100, once: true, event: 'cucu_calling_run' },
    { id: 'tai_nan',    type: 'onEnter', x: 1250, w: 100, once: true, event: 'falling_branch' },
    { id: 'ending',     type: 'onEnter', x: 2200, w: 100, once: true, event: 'ending_ch4' },
  ],

  events: {
    // ============================================================
    // INTRO Ch4: tranh cãi, Chiền Chiện bỏ chạy
    // ============================================================
    intro_ch4: [
      { t: 0,    cmd: 'setVignette', alpha: 0.9 },
      { t: 0,    cmd: 'animateVignette', to: 0, speed: 0.3 },
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 200 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 300 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 400 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'charPose', char: 'choe',  sprite: 'choe_standing_watching' },
      { t: 0,    cmd: 'charPose', char: 'cucu',  sprite: 'cucu_idle_side' },
      { t: 0,    cmd: 'charPose', char: 'chien', sprite: 'chien_idle_side' },

      { t: 500,  cmd: 'narrate', text: 'Rừng sâu. Cây cao. Hai ngã rẽ trước mặt...', duration: 3500, waitForInput: false },
      { t: 4200, cmd: 'say', char: 'choe',  text: 'Đường nào nhỉ...', duration: 2000 },
      { t: 6400, cmd: 'charPose', char: 'cucu', sprite: 'cucu_calling_worried' },
      { t: 6500, cmd: 'say', char: 'cucu',  text: 'Bên này! Em thấy có ánh sáng!', duration: 2200 },
      { t: 8900, cmd: 'charPose', char: 'chien', sprite: 'chien_wonder_awestruck' },
      { t: 9000, cmd: 'say', char: 'chien', text: 'Không! Bên này! Em nghe có tiếng nước chảy!', duration: 2500 },
      { t: 11700, cmd: 'charPose', char: 'cucu', sprite: 'cucu_angry_pointing' },
      { t: 11800, cmd: 'say', char: 'cucu',  text: 'Chiền Chiện sai rồi. Bên này mới đúng!', duration: 2500 },
      { t: 14500, cmd: 'charPose', char: 'chien', sprite: 'chien_yelling_defiant' },
      { t: 14600, cmd: 'say', char: 'chien', text: 'Không phải! Nghe em đi. Đi hướng này!', duration: 2500 },
      { t: 17300, cmd: 'say', char: 'cucu',  text: 'Em biết gì mà nói?! Em còn bé lắm, có thạo đường đâu!', duration: 3200 },

      // Chiền Chiện bị tổn thương, bỏ chạy
      { t: 20800, cmd: 'charPose', char: 'chien', sprite: 'chien_yelling_defiant' },
      { t: 21000, cmd: 'say', char: 'chien', text: 'EM MẶC KỆ ANH! EM TỰ ĐI!', duration: 2500 },
      { t: 23800, cmd: 'moveChar', char: 'chien', toX: 1400, speed: 'run' },
      { t: 23800, cmd: 'faceChar', char: 'chien', dir: 1 },

      // Cúc Cu đứng sững
      { t: 24200, cmd: 'charPose', char: 'cucu', sprite: 'cucu_shocked_regret' },
      { t: 26000, cmd: 'charPose', char: 'choe',  sprite: 'choe_sighing_smile' },
      { t: 26200, cmd: 'say', char: 'choe',  text: '...Đuổi theo Chiền Chiện đi. Anh chạy sau không thì lạc nhau mất.', duration: 3500 },

      // Lock char switch → only Cúc Cu
      { t: 30000, cmd: 'lockCharSwitch' },
      { t: 30000, cmd: 'setLeader', char: 'cucu' },
      { t: 30000, cmd: 'charState', char: 'cucu', state: 'idle' },
      { t: 30200, cmd: 'narrate', text: '💡 Cúc Cu phải chạy theo em! Chỉ điều khiển Cúc Cu.', duration: 4000, tutorial: true, waitForInput: false },
      { t: 30400, cmd: 'releaseInput' },
    ],

    // ============================================================
    // Cúc Cu gọi Chiền Chiện khi đang chạy
    // ============================================================
    cucu_calling_run: [
      { t: 0,    cmd: 'charPose', char: 'cucu', sprite: 'cucu_running_calling' },
      { t: 0,    cmd: 'say', char: 'cucu',  text: 'Chiền Chiện! Chiền Chiện ơi!', duration: 2200, waitForInput: false },
      { t: 2500, cmd: 'say', char: 'cucu',  text: 'Em ơi, quay lại đi! Cho anh xin lỗi!', duration: 2800, waitForInput: false },
    ],

    // ============================================================
    // Tai nạn — cành cây gãy
    // ============================================================
    falling_branch: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 1350 },
      { t: 0,    cmd: 'charPose', char: 'chien', sprite: 'chien_crying_sitting' },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: -1 },

      { t: 300,  cmd: 'narrate', text: 'Tiếng nứt. "CRRRR... CRACK!"', duration: 2500, waitForInput: false },
      { t: 800,  cmd: 'cameraShake', amount: 20 },
      { t: 800,  cmd: 'sfx', sfx: 'sfx_rock_land' },

      // Slow-mo beat — camera shake + dark flash
      { t: 1400, cmd: 'animateVignette', to: 0.5, speed: 4 },
      { t: 1500, cmd: 'cameraShake', amount: 14 },

      // Cúc Cu lao tới cứu
      { t: 1800, cmd: 'charPose', char: 'cucu', sprite: 'cucu_diving_save' },
      { t: 1800, cmd: 'moveChar', char: 'cucu', toX: 1350, speed: 'run' },
      { t: 1900, cmd: 'say', char: 'cucu',  text: 'CHIỀN CHIỆN!', duration: 1500, waitForInput: false },

      // RẦMMMM
      { t: 3500, cmd: 'cameraShake', amount: 30 },
      { t: 3500, cmd: 'sfx', sfx: 'sfx_rock_land' },
      { t: 3500, cmd: 'animateVignette', to: 0.0, speed: 1.2 },

      // 3 giây im lặng — bụi tan dần
      { t: 7000, cmd: 'charPose', char: 'cucu', sprite: 'cucu_shocked_regret' },
      { t: 7000, cmd: 'charPose', char: 'chien', sprite: 'chien_crying_sitting' },
      { t: 7000, cmd: 'charTeleport', char: 'cucu', x: 1350 },

      // Khoảnh khắc hối hận
      { t: 7500, cmd: 'say', char: 'chien', text: 'EM XIN LỖI ANH... EM TƯỞNG BỊ LẠC RỒI... EM KHÔNG DÁM BỎ ĐI MỘT MÌNH NỮA ĐÂU...', duration: 4500 },
      { t: 12300, cmd: 'charPose', char: 'cucu', sprite: 'cucu_arm_around_shoulder' },
      { t: 12500, cmd: 'say', char: 'cucu',  text: 'Anh cũng xin lỗi. Anh quát Chiền Chiện là anh sai. Đừng bao giờ... bỏ đi một mình nữa, nghe không?', duration: 5000 },
      { t: 17700, cmd: 'say', char: 'chien', text: 'Vâng... vâng anh ơi...', duration: 2200 },

      // Chòe chạy tới
      { t: 20200, cmd: 'moveChar', char: 'choe', toX: 1420, speed: 'run' },
      { t: 22000, cmd: 'charPose', char: 'choe', sprite: 'choe_relieved_kneeling' },
      { t: 22000, cmd: 'charTeleport', char: 'choe', x: 1420 },
      { t: 24500, cmd: 'charPose', char: 'choe', sprite: 'choe_sighing_smile' },
      { t: 24700, cmd: 'say', char: 'choe',  text: 'Được rồi. Các em an toàn là anh mừng rồi. Đi, chúng ta đi tiếp thôi.', duration: 3500 },

      // Unlock — player gets control back
      { t: 28500, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 28500, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 28500, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 28500, cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 28500, cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 28500, cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 28500, cmd: 'attachChars', child: 'chien', parent: 'cucu' },
      { t: 28700, cmd: 'unlockCharSwitch' },
      { t: 28700, cmd: 'releaseInput' },
    ],

    // ============================================================
    // ENDING Ch4: ba anh em đi tiếp cùng nhau
    // ============================================================
    ending_ch4: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'detachChars', child: 'chien' },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 2300 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 2200 },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 2400 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 0,    cmd: 'charState', char: 'chien', state: 'idle' },

      { t: 600,  cmd: 'narrate', text: 'Có những hiểu lầm làm ta lớn lên. Cúc Cu và Chiền Chiện sẽ nhớ mãi bài học này...', duration: 5000, waitForInput: false },
      { t: 6000, cmd: 'say', char: 'chien', text: 'Anh Cúc Cu... cầm tay em đi.', duration: 2500 },
      { t: 8700, cmd: 'attachChars', child: 'chien', parent: 'cucu' },
      { t: 9000, cmd: 'say', char: 'cucu',  text: 'Ừ. Lần này anh không bao giờ bỏ tay em nữa.', duration: 3000 },
      { t: 12300, cmd: 'narrate', text: 'Chiền Chiện cầm tay Cúc Cu thật chặt — không bao giờ muốn buông nữa.', duration: 4000, waitForInput: false },
      { t: 12800, cmd: 'animateVignette', to: 1.0, speed: 0.35 },
      { t: 16600, cmd: 'detachChars', child: 'chien' },
      { t: 16800, cmd: 'showTransition', title: 'Chương 4 — Rừng Sâu', next: 5 },
    ],
  },
};
