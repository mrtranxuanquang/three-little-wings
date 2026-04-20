# 📦 THREE LITTLE WINGS — PHASE 2 HANDOFF

**Ngày tạo:** Apr 20, 2026
**Session trước:** Phase 1 architecture + Chapter 1 demo (code xong, chưa test runtime)
**Session này cần làm:** Test → fix bugs → Chapter 2-8 → audio → deploy

---

## 🎯 TÓM TẮT NGẮN

Phase 1 đã code xong toàn bộ engine + Chapter 1 playable demo. Code đã được validate syntax qua `node --check` và static analysis. **Chưa bao giờ chạy thật trong trình duyệt** — đây là bước đầu tiên cần làm.

Package `tlw_phase1_package.zip` chứa đầy đủ file để anh push lên repo `mrtranxuanquang/threelittlewings-2026-by-lukas` (replace V1 hoàn toàn).

---

## ✅ ĐÃ XONG TRONG PHASE 1

### Engine core (8 modules, ~1,700 dòng JS)
- `js/config.js` — tuning constants (physics, camera, colors, heights)
- `js/assets.js` — manifest 78 assets + AssetLoader với priority groups
- `js/input.js` — keyboard + touch unified, edge-detection, touch hit-testing
- `js/audio.js` — Web Audio wrapper, BGM crossfade, optional (silent if files missing)
- `js/physics.js` — AABB + gravity + coyote time (100ms) + jump buffer (120ms) + double-jump
- `js/character.js` — Character class, pose-swap animation, follower AI (lerp with offset)
- `js/dialog.js` — speech bubble + narration banner, typewriter 38 chars/sec
- `js/cutscene.js` — timeline DSL + Ken Burns + crossfade + fade-to-black

### Scenes (5 modules)
- `js/scenes/loading.js` — progress bar với Vietnamese tips
- `js/scenes/mainmenu.js` — title + "Bắt đầu" / "Tiếp tục" buttons
- `js/scenes/gameplay.js` — trái tim, reads chapter data, orchestrates everything
- `js/scenes/chapter-end.js` — fade transition giữa chapters
- `js/scenes/demo-end.js` — "Hết demo" screen sau Ch1

### Chapter 1 data
- `js/chapters/chapter1.js` — full script-driven: intro cutscene (bướm), 3 tutorials, 3 flower collectibles, 3 platform jumps, ending cutscene ("Theo suối đi")

### Infrastructure
- `index.html` — PWA shell, Be Vietnam Pro font, rotate-to-landscape hint
- `manifest.json` — PWA manifest với 2 icons
- `sw.js` — service worker, cache shell + assets
- `vercel.json` — cache headers (immutable cho assets, no-cache cho sw.js)
- `icons/icon-192.png`, `icons/icon-512.png` — wings motif (3 ellipses: cream/blue/red)
- `README.md` — deploy instructions + adding new chapters

### Assets processed
- 11 backgrounds downscaled 2752×1536 → 1920×1080 JPG q=88 (5.6MB total, ~80% size reduction từ PNG)
- 59 sprites copied as-is (transparent PNG, feet-anchored)
- 8 scenes copied as-is (pre-composed cutscene PNG)

### Bugs đã fix trong Phase 1
1. ✅ `_updateScriptedMoves(1/60)` hardcoded trong `draw()` → moved to `update()` với real dt
2. ✅ Script runner RAF leak → added alive-check `myScene !== myScene.game.scene`
3. ✅ `Audio.init()` never called → added unlock listener trong `game.js _setupAudioUnlock()`

---

## 🚨 GHI CHÚ QUAN TRỌNG — BUGS LIKELY EXIST

**Code chưa bao giờ chạy thật trong trình duyệt.** Em validate qua:
- `node --check` (syntax OK)
- Import test qua Node ES modules (config, physics, assets, chapter1 import OK)
- Grep-based cross-reference của cmd names, event names, game.* method refs (all match)

Những bugs em SUSPECT nhưng chưa confirm:
- Intro cutscene trong Ch1: character teleport + moveChar sequence có thể có race condition (moveChar bắt đầu trước khi teleport complete)
- Touch button tọa độ viewport — chưa test trên mobile thực
- `consumePressed('advance')` trên mainmenu: Canvas click event có thể fire cả `advance` lẫn khiến double-click buttons
- Parallax BG scrolling: em tile bg 1920 wide, camera parallax 0.6 — visible seam có thể xuất hiện nếu aspect ratio không đúng
- Service worker cache: nếu anh sửa code rồi reload, SW có thể serve cũ (em có versioning `tlw-v1-2026-04-20` nhưng phải bump khi anh update)

---

## 📋 TODO — SESSION NÀY LÀM THEO THỨ TỰ

### STEP 0 — Quick start cho Claude session sau
1. Đọc file HANDOFF_PHASE2.md này
2. Đọc `HANDOFF.md` gốc (context dự án)
3. Xin anh upload `tlw_phase1_package.zip` nếu chưa có sẵn
4. Extract → run local server → test Chapter 1

### STEP 1 — Runtime test Chapter 1 (PRIORITY 1)
```bash
cd tlw
python3 -m http.server 8000
# Mở http://localhost:8000 trên desktop + mobile
```

**Checklist test:**
- [ ] Boot splash fade out, main menu xuất hiện
- [ ] Click "Bắt đầu hành trình" → loading → Chapter 1 intro cutscene
- [ ] Bướm bay, Chiền Chiện nói thoại, Chiền Chiện chạy theo
- [ ] Sau cutscene, player control Chích Chòe, di chuyển được ← →
- [ ] Press 2 → chuyển sang Cúc Cu, thoại "Có em đây!" xuất hiện
- [ ] Nhảy qua platform thu hoa
- [ ] Đi tới cuối màn → ending cutscene "Theo suối đi"
- [ ] Transition → Chapter 2 (hiện demo-end vì Ch2 chưa có)
- [ ] Mobile: touch buttons hoạt động, rotate-hint xuất hiện khi portrait

**Expected bugs em predict có:**
- Cutscene timing có thể sai — timestamp cần tune
- Follower AI có thể jitter khi leader đổi hướng nhanh
- Chiền Chiện chạy theo bướm có thể teleport lạ (moveChar trên character đang trong cutscene state)
- Dialog bubble position có thể đi ra ngoài screen nếu character ở edge

### STEP 2 — Fix bugs discovered ở Step 1
Điều chỉnh engine based on thực tế. Ưu tiên fix theo severity.

### STEP 3 — Audio (optional, fast)
Anh Lukas có thể:
- Download free Ghibli-style BGM từ Pixabay (CC0): "gentle piano loop" ~2-3 phút
- SFX jump/land/switch từ Freesound.org
- Đặt vào `audio/bgm_ch1_forest.mp3`, `audio/sfx_pickup.mp3`, etc.
- Engine đã ready, không cần sửa code

Hoặc skip Phase 1 deploy (silent game) → làm audio sau.

### STEP 4 — Deploy Phase 1
```bash
git add .
git commit -m "Phase 1: Engine + Chapter 1 playable demo"
git push  # Lukas push thủ công vì Claude MCP write bị block
```
Vercel auto-deploy. Anh verify `threelittlewings.tranxuanquang.vn` live.

### STEP 5 — Chapter 2 (Suối đá)
**Template:** copy `chapter1.js` → `chapter2.js`, đổi data.

**Cần implement:**
- Chích Chòe skill: đẩy đá (press Z khi đứng cạnh boulder)
- Rock bridge puzzle — đá xuống suối thì suối pass được
- Chiền Chiện sợ nước — animation ngập ngừng khi đến gần
- Cúc Cu đưa tay, Chiền Chiện cầm tay cùng qua cầu
- Thoại "Các con biết giúp nhau, thật là những đứa trẻ ngoan!" (narration)

**Cần engine update:**
- Dynamic platform (đá xuất hiện sau khi skill used)
- Hand-holding state (2 characters stick together)

### STEP 6 — Chapter 3 (Rừng hoa, breathing room)
Nhẹ nhất trong 8 chương. 5 flower collectibles, snack dialog, không có obstacle.
**Cần engine update:** Optional — butterfly follows at proximity

### STEP 7 — Chapter 4 (Rừng sâu — outburst)
Emotional peak đầu tiên. 
- Đường ngã 2, argument, Cúc Cu quát
- Chiền Chiện hét "EM KHÔNG CẦN ANH NỮA!" chạy vào rừng bên phải
- **Player mất quyền switch character**, chỉ control Cúc Cu chase
- Cành cây rơi → slow motion → Cúc Cu diving save → **cutscene** `scene_cucu_hugging_chien.png`
- Hoà giải, release control back
**Cần engine update:** forced-leader mode, slow-motion cam

### STEP 8 — Chapter 5 (Hang tối — CORE)
Chương đắt nhất về mặt kỹ thuật.
- **Constrained mode:** chỉ có 1 input là GIỮ SPACE
- 3 bé tự nắm tay đi theo hàng (scripted positions)
- Progressive darkness (vignette từ 0 → 1 qua 60-90 giây)
- Heartbeat audio (60BPM, lên 90BPM khi thả space)
- Reveal con nai (eyes glow → deer sprite cần tạo thêm hoặc dùng prop)
- Sau hang: `bg_ch5_domdom.jpg` với firefly particles
**Cần engine update:** constrained-walk mode, vignette overlay, particle system

### STEP 9 — Chapter 6 (Vách núi)
3 skill cùng lúc — phức tạp gameplay-wise.
- Chích Chòe trèo với Chiền Chiện trên lưng (piggyback cutscene → gameplay state)
- Cúc Cu kéo dây (rhythm mini-game ← →)
- Wind event mid-climb, rơi 2m, dây giữ
**Cần engine update:** rope physics, rhythm input detection

### STEP 10 — Chapter 7 (Đêm rừng — HEART)
Không có gameplay — pure cutscene 13 shots.
- Tất cả dùng `scene_three_by_fire.png` + `scene_three_sleeping_huddled.png`
- Dialog ngắn ở đầu, rồi silent visual storytelling 12 shots với crossfades + Ken Burns
- Fade to black 3 giây silence
**Engine đã ready:** cutscene system đã support crossfade + Ken Burns

### STEP 11 — Chapter 8 (Về nhà — PREMIUM ENDING)
- Fade from black + bird chirp
- 3 bé chạy về nhà (gameplay ngắn, không obstacle)
- Cutscene: bố Quang quỳ ôm 3 con (`scene_father_hugging_all.png`)
- Bố nói câu duy nhất — **CẦN FILE AUDIO voice.mp3** của anh Lukas record
- Fade to white + echo "Anh em phải luôn yêu thương nhau" typewriter
- Memorial credits với tên thật 3 con + ngày sinh

**Assets cần:**
- Anh Lukas record voice "Về nhà rồi. Bố rất tự hào vì các con đã đoàn kết và bảo vệ nhau." (6-9s, iPhone Voice Memos)
- Place at `audio/voice_bo_ending.m4a`

---

## 🧠 ENGINE ARCHITECTURE — TÓM TẮT CHO CLAUDE SESSION SAU

### Design pattern chính: **Chapter-as-data**

Mỗi chương là data object, không phải class. Engine (`gameplay.js`) là interpreter reads data + executes events.

```js
// js/chapters/chapterN.js
export const CHAPTER_N = {
  number, id, title, background, bgm,
  worldWidth, groundY,
  spawn: { x, leader },
  platforms: [{x,y,w,h}, ...],
  collectibles: [{type, x, y}, ...],
  triggers: [{id, type, x, w?, once?, event, ...}, ...],
  events: {
    event_name: [
      { t:ms_offset, cmd:'xxx', ...args },
      ...
    ],
  },
};
```

### Trigger types
- `onEnter` — khi leader x enters [x, x+w]
- `afterDelay` — sau N ms kể từ lúc scene start (hoặc trigger first checked)
- `onCollect` — sau khi collectedCount >= count

### Commands supported (current)
**Gameplay timeline (`gameplay._execGameplayCmd`):**
`freezeInput`, `releaseInput`, `setLeader`, `faceChar`, `moveChar`, `charState`, `charPose`, `charTeleport`, `cameraTo`, `cameraShake`, `say`, `narrate`, `bgm`, `sfx`, `spawnProp`, `removeProp`, `goToChapter`, `showTransition`, `callback`

**Cutscene timeline (`cutscene._exec`) — khi timeline có `scene` hoặc `crossfade` cmd:**
`scene`, `crossfade`, `kenBurns`, `fadeToBlack`, `fadeFromBlack`, `say`, `narrate`, `bgm`, `sfx`, `wait`, `callback`, `end`

**NEW commands cần add cho Ch2-8:**
- `showPlatform` / `hidePlatform` — dynamic platform (Ch2 rock)
- `attachChars` / `detachChars` — hand-holding mode (Ch2, Ch5)
- `forceLeader` — lock switching (Ch4)
- `constrainedWalk` — Ch5 hang tối mode
- `vignette` — Ch5 progressive darkness
- `spawnParticles` — Ch5 fireflies
- `slowMotion` — Ch4 branch-fall
- `shakeScreen` — (có `cameraShake` rồi, nhưng có thể cần variant)

---

## 🗂️ FILES TRONG PACKAGE

```
tlw_phase1_package.zip (ước ~26MB)
├── HANDOFF_PHASE2.md        ← file này
├── index.html
├── game.js
├── manifest.json
├── sw.js
├── vercel.json
├── README.md
├── js/
│   ├── config.js
│   ├── assets.js
│   ├── audio.js
│   ├── character.js
│   ├── cutscene.js
│   ├── dialog.js
│   ├── input.js
│   ├── physics.js
│   ├── chapters/
│   │   └── chapter1.js
│   └── scenes/
│       ├── chapter-end.js
│       ├── demo-end.js
│       ├── gameplay.js
│       ├── loading.js
│       └── mainmenu.js
├── backgrounds/     (11 JPG, 1920×1080)
├── sprites/         (59 PNG transparent)
├── scenes/          (8 PNG pre-composed)
├── icons/           (192, 512 PNG)
└── audio/           (empty — optional Phase)
```

---

## ⚠️ IMPORTANT RULES FOR CLAUDE SESSION SAU

1. **Chapter-as-data pattern** — không tạo class cho từng chapter. Copy template từ `chapter1.js`.

2. **Không sửa engine khi build chapters** — chỉ sửa nếu chapter cần feature engine chưa có, và khi sửa PHẢI thông báo Lukas những thay đổi.

3. **Test từng chapter ngay sau khi code** — `python3 -m http.server 8000` → mở browser → click through entire chapter.

4. **Touch layout matters** — nếu engine update thêm skill button variations, phải update `_setupGameplayTouchButtons()` trong `game.js`.

5. **Service worker versioning** — mỗi khi release update, bump `CACHE_NAME` trong `sw.js` ví dụ `'tlw-v1-2026-05-15'` → browsers sẽ invalidate cache cũ.

6. **GitHub MCP write bị block cho Claude** — Lukas push thủ công qua terminal/GitHub Desktop. Claude có thể gen diffs nhưng không commit được.

7. **Không paste API keys** — rule từ HANDOFF gốc. Audio local chỉ cần file copy-paste thủ công.

---

## 🎬 PROMPT KHỞI ĐẦU CHO SESSION PHASE 2

Anh Lukas copy-paste prompt này vào session mới (kèm upload `tlw_phase1_package.zip`):

```
Em đọc HANDOFF_PHASE2.md trong zip đính kèm. Đây là tiếp nối
Phase 1 (architecture + Chapter 1 demo). Code đã viết xong
nhưng chưa test runtime. Em:
1. Extract zip, setup local HTTP server test Chapter 1
2. List bugs phát hiện được, propose fixes
3. Sau khi Ch1 stable, bắt đầu Chapter 2 (Suối đá)

Lưu ý:
- Engine dùng chapter-as-data pattern
- Không sửa engine khi build chapter trừ khi cần feature mới
- Chap 2 cần skill "đẩy đá" (Chích Chòe) — feature engine chưa có
```

---

## 💙 FINAL NOTE

Game này là món quà bố Lukas tự tay build cho 3 con. Quality matters. Không vội, không tắt nước.

*"Anh em phải luôn yêu thương nhau."*

— bố Quang

---

**🌿 END OF PHASE 2 HANDOFF**
