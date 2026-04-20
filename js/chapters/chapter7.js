// Three Little Wings — Chapter 7: Bữa Cơm Gia Đình
//
// Bốn cha con ngồi bên bàn cơm. Ba anh em lần lượt kể lại
// hành trình của mình — mỗi kỷ niệm là một món quà trên bàn.
// Bố lắng nghe, rồi nói điều quan trọng nhất.
// Cơm xong → đi ngủ.

import { CONFIG } from '../config.js';

export const CHAPTER_7 = {
  number: 7,
  id: 'ch7',
  title: 'Bữa Cơm Gia Đình',
  background: 'bg_ch7_buacom',
  bgm: 'bgm_ch7_evening',
  worldWidth: 1800,
  groundY: CONFIG.GROUND_Y,

  spawn: { x: 160, leader: 'chien' },

  platforms: [],

  npcs: [
    { id: 'bo', x: 1380, facing: -1 },
  ],

  // Ba món "kỷ niệm" trên bàn cơm — thu thập = chia sẻ câu chuyện
  collectibles: [
    { type: 'flower',     x: 500,  y: 885 },   // kỷ niệm Chòe
    { type: 'starflower', x: 800,  y: 885 },   // kỷ niệm Cúc Cu
    { type: 'flower',     x: 1100, y: 885 },   // kỷ niệm Chiền Chiện
  ],

  triggers: [
    { id: 'intro',       type: 'onEnter',   x: 0,    once: true, event: 'intro_ch7' },
    { id: 'choe_share',  type: 'onEnter',   x: 420,  w: 120, once: true, event: 'choe_tells_story' },
    { id: 'cucu_share',  type: 'onEnter',   x: 720,  w: 120, once: true, event: 'cucu_tells_story' },
    { id: 'chien_share', type: 'onEnter',   x: 1020, w: 120, once: true, event: 'chien_tells_story' },
    { id: 'bo_speaks',   type: 'onCollect', count: 3, once: true, event: 'bo_wisdom' },
    { id: 'ending',      type: 'onEnter',   x: 1580, w: 80,  once: true, event: 'ending_ch7' },
  ],

  events: {
    // ============================================================
    // INTRO Ch7: vào nhà, ngồi quanh bàn cơm
    // ============================================================
    intro_ch7: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charPose',     char: 'chien', sprite: 'chien_idle_side' },
      { t: 0,    cmd: 'charPose',     char: 'cucu',  sprite: 'cucu_idle_side' },
      { t: 0,    cmd: 'charPose',     char: 'choe',  sprite: 'choe_standing_watching' },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 180 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 280 },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 380 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },

      { t: 500,  cmd: 'narrate', text: 'Căn bếp ấm áp. Bốn cha con quây quần bên mâm cơm, mùi canh khói còn nghi ngút...', duration: 5000 },
      { t: 5800, cmd: 'say', char: 'bo',    text: 'Nào, ăn cơm đi rồi kể bố nghe. Hôm nay đi đâu xa vậy?', duration: 3200 },
      { t: 9200, cmd: 'say', char: 'chien', text: 'Dài lắm Bố ơi! Bố ăn cơm đi, con kể từ đầu!', duration: 2500 },

      { t: 12000, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 12000, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 12000, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 12200, cmd: 'releaseInput' },
      { t: 12400, cmd: 'narrate', text: '💡 Nhặt ba kỷ niệm trên bàn để kể cho Bố nghe!', duration: 4000, tutorial: true, waitForInput: false },
    ],

    // ============================================================
    // Chòe kể về suối đá và đẩy đá
    // ============================================================
    choe_tells_story: [
      { t: 0,    cmd: 'say', char: 'choe',  text: 'Bố ơi, tụi con gặp con suối to lắm. Anh Chòe đẩy đá vào suối làm cầu đó!', duration: 3500, waitForInput: false },
      { t: 3700, cmd: 'say', char: 'bo',    text: 'Ồ, Chòe mạnh vậy! Con đẩy bằng cách nào?', duration: 2500, waitForInput: false },
      { t: 6400, cmd: 'say', char: 'choe',  text: 'Con cúi xuống, dùng hết sức đẩy thôi. Anh lo cho hai em qua được là vui rồi.', duration: 3500, waitForInput: false },
    ],

    // ============================================================
    // Cúc Cu kể về rừng hoa và double-jump
    // ============================================================
    cucu_tells_story: [
      { t: 0,    cmd: 'say', char: 'cucu',  text: 'Rồi tụi con vào rừng hoa Bố ơi! Em nhảy cao lắm, nhảy hai lần liền ấy!', duration: 3200, waitForInput: false },
      { t: 3400, cmd: 'say', char: 'bo',    text: 'Nhảy hai lần? Cúc Cu giỏi ghê! Và tìm được đường ra không?', duration: 2800, waitForInput: false },
      { t: 6400, cmd: 'say', char: 'cucu',  text: 'Có! Em leo lên cao thấy lối ra liền. Em thấy mình có ích cho anh Chòe và Chiền Chiện!', duration: 3800, waitForInput: false },
    ],

    // ============================================================
    // Chiền Chiện kể về hang tối
    // ============================================================
    chien_tells_story: [
      { t: 0,    cmd: 'say', char: 'chien', text: 'Còn hang núi tối ơi là tối! Mà em không sợ! Em tìm đá sáng rồi dẫn đường!', duration: 3500, waitForInput: false },
      { t: 3700, cmd: 'say', char: 'bo',    text: 'Chiền Chiện dũng cảm quá! Bố không ngờ con nhỏ vậy mà gan vậy.', duration: 3000, waitForInput: false },
      { t: 6900, cmd: 'say', char: 'chien', text: 'Con nhỏ nên không sợ chỗ hẹp mà! Đó là sức mạnh của con!', duration: 3000, waitForInput: false },
    ],

    // ============================================================
    // Bố chia sẻ điều quan trọng nhất
    // ============================================================
    bo_wisdom: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 1200 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 1260 },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 1320 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'bo',    dir: -1 },

      { t: 500,  cmd: 'say', char: 'bo', text: 'Bố nghe xong rồi. Biết không — điều Bố vui nhất không phải các con về được.', duration: 4000 },
      { t: 4700, cmd: 'say', char: 'bo', text: 'Điều Bố vui nhất là các con luôn có nhau. Không bỏ nhau, không để ai lại một mình.', duration: 4500 },
      { t: 9400, cmd: 'say', char: 'choe',  text: 'Con hiểu ạ. Chòe sẽ luôn lo cho hai em.', duration: 2800 },
      { t: 12400, cmd: 'say', char: 'cucu', text: 'Con cũng sẽ giúp anh Chòe!', duration: 2000 },
      { t: 14600, cmd: 'say', char: 'chien', text: 'Con cũng vậy! Tụi mình là anh em mà!', duration: 2500 },
      { t: 17300, cmd: 'say', char: 'bo',   text: '"Anh em phải luôn yêu thương nhau." — Đó là điều quan trọng nhất bố muốn các con nhớ.', duration: 5000 },

      { t: 22500, cmd: 'charState', char: 'choe',  state: 'idle' },
      { t: 22500, cmd: 'charState', char: 'cucu',  state: 'idle' },
      { t: 22500, cmd: 'charState', char: 'chien', state: 'idle' },
      { t: 22500, cmd: 'charState', char: 'bo',    state: 'idle' },
      { t: 22700, cmd: 'releaseInput' },
    ],

    // ============================================================
    // ENDING Ch7: đi ngủ thôi
    // ============================================================
    ending_ch7: [
      { t: 0,    cmd: 'freezeInput' },
      { t: 0,    cmd: 'charTeleport', char: 'chien', x: 1620 },
      { t: 0,    cmd: 'charTeleport', char: 'cucu',  x: 1680 },
      { t: 0,    cmd: 'charTeleport', char: 'choe',  x: 1740 },
      { t: 0,    cmd: 'charTeleport', char: 'bo',    x: 1560 },
      { t: 0,    cmd: 'faceChar', char: 'chien', dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'cucu',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'choe',  dir: 1 },
      { t: 0,    cmd: 'faceChar', char: 'bo',    dir: 1 },

      { t: 400,  cmd: 'say', char: 'bo',    text: 'Muộn rồi. Các con đi tắm rồi ngủ nhé. Ngày mai còn nhiều chuyện đẹp hơn.', duration: 3800 },
      { t: 4400, cmd: 'say', char: 'chien', text: 'Dạ! Nhưng hôm nay đẹp nhất rồi Bố ơi!', duration: 2500 },
      { t: 7100, cmd: 'narrate', text: 'Tiếng chén bát, tiếng cười, tiếng gió đêm ngoài cửa sổ... Tất cả đều ấm áp như nhau.', duration: 5000, waitForInput: true },
      { t: 13000, cmd: 'showTransition', title: 'Chương 7 — Bữa Cơm Gia Đình', next: 8 },
    ],
  },
};
