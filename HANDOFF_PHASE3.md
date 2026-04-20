# 📦 THREE LITTLE WINGS — PHASE 3 HANDOFF

**Ngày tạo:** Apr 20, 2026 (phiên 2)
**Session trước:** Static audit + 14 bug fixes (runtime chưa test)
**Session này cần làm:** Runtime test Ch1 → fix bugs phát hiện trong browser → Chapter 2 (Suối đá)

---

## 🎯 TÓM TẮT NGẮN

Phase 2 session đầu đã làm **static audit sâu** toàn bộ engine (~3000 dòng JS) và fix **14 bugs** không cần chạy browser. Code trong zip này đã được node --check cho syntax OK. Bước tiếp theo là **runtime test trong browser thật** — vì một số bugs chỉ lộ ra khi chạy (touch layout thực, timing feel, asset paths).

Package này là **tlw_phase1_package.zip** GỐC + 14 fix đã áp dụng. Anh có thể push replace V1 lên repo ngay sau khi runtime test xong.

---

## ✅ ĐÃ FIX TRONG PHIÊN TRƯỚC

### Critical bugs (blocking mobile/touch)
| # | File | Fix |
|---|---|---|
| C1 | `gameplay.js`, `game.js` | Touch buttons giờ được **vẽ** với Ghibli wooden style (gradient, rim, icon chevron/leaf/star), press state animation, thumb-friendly size scaling theo viewport |
| C2 | `input.js`, `mainmenu.js` | Menu touch giờ hoạt động: buttons register hitbox + `touchstart` fire `advance` khi không hit button nào |
| C3 | `input.js` | `mousedown` set `b.mouseHeld=true` để `mouseup` release đúng (trước: button stuck pressed trên desktop) |
| C4 | `gameplay.js` | Follower skip `followUpdate` khi có `_scriptedMove` — hết jitter khi intro cutscene chạy |
| C5 | `gameplay.js` | `_runScriptedEvent` fire t=0 cmds synchronously trước khi return — hết 1-frame window user control được trước khi freeze |

### Real bugs (UX issues)
| # | File | Fix |
|---|---|---|
| R1, R2 | `cutscene.js` | Auto-end đợi crossfade + Ken Burns complete (trước: scene cuối bị cắt) |
| R3 | `cutscene.js` | Crossfade commit trong update loop (bỏ setTimeout, không bị tab throttle) |
| R4 | `gameplay.js` | Scripted moves + props tiếp tục update trong dialog mode — cutscenes không freeze khi say |
| R5 | `dialog.js` | Speech bubble clamp vào screen, tail vẫn point về character |
| R6 | `gameplay.js` | Follower side tracking với 0.4s commit delay — leader quay không teleport followers |
| R7 | `character.js` | Progressive walk→run speed (0.45s ramp) — tutorial feel nhẹ nhàng hơn cho bé 6t |
| R8 | `assets.js`, `character.js` | Missing sprite giờ hiển thị placeholder đỏ với text "?" + key name thay vì silently biến mất. `reportFailures()` log console sau boot. |
| R9 | `gameplay.js` | `scriptElapsed` accumulated từ main dt thay vì `performance.now()` absolute — pause không làm timeline nhảy |
| R10 | `gameplay.js` | Scripted moves giờ routed qua `updateBody` → gravity apply đúng |

### Housekeeping
- SW cache bumped: `tlw-v1.1-2026-04-20-fixes` (force invalidate cache cũ trên browser)
- Import `updateBody` vào gameplay.js cho R10

---

## 🔬 TODO PHIÊN NÀY — ORDER NÀY

### STEP 1 — Extract + runtime test (PRIORITY 1)

```bash
cd /path/to/project
unzip tlw_phase2_fixed_package.zip -d tlw
cd tlw
python3 -m http.server 8000
# Mở http://localhost:8000 trên:
#   • Desktop Chrome (F12 open DevTools, check console)
#   • iPhone/Android (same wifi, navigate to http://<desktop-ip>:8000)
```

### STEP 2 — Test checklist Ch1 (follow theo thứ tự)

**Boot & menu:**
- [ ] Boot splash fade out (~500ms)
- [ ] Progress bar loading: "Đang tải..." → "Sẵn sàng!" → 100%
- [ ] Console: no red errors (orange warnings về missing audio OK)
- [ ] Main menu hiện với title + "Bắt đầu hành trình"
- [ ] **Desktop:** click button → vào game
- [ ] **Mobile:** tap button → vào game (Fix C2)

**Intro cutscene:**
- [ ] Fire ngay khi vào: 3 bé đứng, narration "Một chiều cuối tuần..." fade in
- [ ] Bướm xanh xuất hiện bay từ trái sang phải (wobble sine motion)
- [ ] Chiền Chiện: "Ơ! Bướm đẹp quá!" + sprite chuyển sang wonder_awestruck
- [ ] Chiền Chiện chạy (moveChar đến x=900) — **không bị giật/teleport** (Fix C4)
- [ ] Cúc Cu: "Em ơi! Đừng chạy xa!" + chạy theo (moveChar đến x=800)
- [ ] Chích Chòe: "...Haizz. Đi, anh đi với các em." + sighing_smile sprite
- [ ] Tất cả về idle, bướm remove
- [ ] Narrate tutorial xuất hiện: "💡 Dùng ← → để đi..."

**Gameplay:**
- [ ] Có thể di chuyển Chích Chòe (leader) với ← →
- [ ] **Feel:** bắt đầu đi walk, sau ~0.5s chuyển sang run (Fix R7)
- [ ] Space nhảy — coyote time + jump buffer feel responsive
- [ ] Press 2 → chuyển sang Cúc Cu, thoại "Có em đây!" xuất hiện
- [ ] Cúc Cu có double-jump (press Space trong không → nhảy lần 2)
- [ ] Press 3 → chuyển sang Chiền Chiện, thoại "Yay! Đến em rồi!"
- [ ] Quay lại ← rồi → → — followers **không teleport sang bên kia** (Fix R6)
- [ ] Tutorial "switch" hiện sau 6.5s
- [ ] Đi tới x=1250 → tutorial "jump" hiện
- [ ] Nhảy qua platforms, thu 3 bông hoa (counter top-left tăng)
- [ ] Đi tới x=3700 → ending_scene fires

**Ending cutscene:**
- [ ] Teleport + face — 3 bé đứng
- [ ] Chòe: "Đường về nhà hình như ngược lại rồi..."
- [ ] Cúc Cu: "Vậy mình đi đường nào hả anh?"
- [ ] Chòe pointing_direction sprite + "Theo suối đi..."
- [ ] Narrate "Và thế là hành trình bắt đầu..."
- [ ] Transition → Chapter End scene → Demo End (vì Ch2 chưa có)

**Mobile specific:**
- [ ] Touch buttons **visible** (Ghibli wooden) ở bottom-left (d-pad) và bottom-right (jump + skill) (Fix C1)
- [ ] Tap button → press animation (shrink 6%, darken)
- [ ] Rotate hint hiện khi portrait, ẩn khi landscape
- [ ] Tap character portrait (top-right) → switch character
- [ ] Tap anywhere khi dialog đang show → advance dialog

**Edge cases:**
- [ ] Move đến mép màn hình trái → speech bubble không bị cut (Fix R5)
- [ ] Switch tab rồi quay lại (15 giây) → cutscene không nhảy sai timeline (Fix R9)
- [ ] Console log sau boot: nếu audio/bgm_* thiếu → warn nhưng không error

### STEP 3 — Report bugs còn lại về Claude

Khi test xong, anh copy/paste cho Claude:
1. Console errors (nếu có)
2. Screenshots hoặc video clips của bugs
3. Behavior không đúng checklist

Claude sẽ debug tiếp dựa trên evidence thực tế.

### STEP 4 — Deploy Phase 1 (nếu Ch1 OK)

```bash
cd <repo>
# replace all files with those from this zip
git add .
git commit -m "Phase 1 + fixes: Engine + Ch1 playable (14 bug fixes)"
git push
```
Vercel auto-deploy → test `threelittlewings.tranxuanquang.vn`.

### STEP 5 — Chapter 2 (Suối đá)

**Skill design** (đã quyết trong phiên trước):
> **Giữ Z → đẩy đá lăn theo tốc độ character.** Lý do: match cảm xúc "các con biết giúp nhau" — cần effort liên tục, không phải tap spam (feel như game arcade), không phải cutscene auto (không có agency).

**Engine features cần thêm cho Ch2:**
1. **Boulder entity** — new prop type, có collider, có skill interaction
2. **`pushRock` skill cmd** — chỉ Chòe dùng được, khi đứng cạnh boulder + giữ Z
3. **Dynamic platforms** — `showPlatform` / `hidePlatform` cmds (đá nằm xuống thành cầu)
4. **Hand-holding state** — `attachChars parent child` / `detachChars child` cmds (Cúc Cu dắt Chiền Chiện qua cầu)
5. **Character fear/hesitation** — Chiền Chiện state "afraid of water", animation ngập ngừng khi đến gần suối

**Chapter 2 structure (draft):**
```
Start at x=200, leader=choe
→ x=600: Chiền Chiện thấy suối, pose "hesitant_back", say "Em... sợ nước"
→ x=800: Boulder (rock_big, static)
→ Tutorial: "💡 Chích Chòe khoẻ nhất, giữ Z để đẩy đá"
→ User switches to Chòe, holds Z, pushes boulder into stream
→ Boulder triggers hidden platform reveal (rock bridge)
→ x=1400: Cúc Cu reaches hand to Chiền Chiện (cucu_reaching_hand_out sprite)
→ Narration: "Các con biết giúp nhau, thật là những đứa trẻ ngoan!"
→ 3 bé cross bridge together (hand-hold visual)
→ x=2400: ending trigger → showTransition Ch3
```

**File plan:**
- New: `js/chapters/chapter2.js`
- Modified: `js/scenes/gameplay.js` (add cmds: `pushRock`, `showPlatform`, `hidePlatform`, `attachChars`, `detachChars`)
- Modified: `game.js` (import CHAPTER_2)
- Modified: `sw.js` (add chapter2.js to SHELL, bump cache version)

---

## 🗂️ FILES TRONG PACKAGE

```
tlw_phase2_fixed_package.zip (~26MB, same assets)
├── HANDOFF_PHASE3.md           ← file này
├── HANDOFF_PHASE2.md           ← giữ lại để reference
├── README.md
├── index.html
├── game.js                     ✏️ modified (touch buttons, viewW/viewH, reportFailures)
├── manifest.json
├── sw.js                       ✏️ modified (cache bumped v1.1)
├── vercel.json
├── js/
│   ├── assets.js               ✏️ modified (reportFailures)
│   ├── audio.js
│   ├── character.js            ✏️ modified (walk→run ramp, missing sprite placeholder)
│   ├── config.js
│   ├── cutscene.js             ✏️ modified (auto-end check crossfade + KB)
│   ├── dialog.js               ✏️ modified (bubble clamp + tail track)
│   ├── input.js                ✏️ modified (touch → advance, mouseHeld)
│   ├── physics.js
│   ├── chapters/
│   │   └── chapter1.js         (unchanged)
│   └── scenes/
│       ├── chapter-end.js
│       ├── demo-end.js
│       ├── gameplay.js         ✏️ modified (BIG: Ghibli buttons, follower fixes, script runner, dialog mode keeps world alive)
│       ├── loading.js
│       └── mainmenu.js         ✏️ modified (touch hitboxes)
├── backgrounds/     (11 JPG, unchanged)
├── sprites/         (59 PNG, unchanged)
├── scenes/          (8 PNG, unchanged)
├── icons/           (unchanged)
└── audio/           (empty — optional)
```

---

## ⚠️ BUGS CÒN KHẢ NĂNG TỒN TẠI (phát hiện qua runtime test)

Em predict những cái này có thể xuất hiện trên browser:

1. **Parallax BG seam** — nếu BG không loop perfectly, có visible strip khi camera scroll
2. **Audio missing warnings** — `audio/bgm_ch1_forest.mp3` không tồn tại → console warn nhưng game vẫn chạy silent
3. **Ground shadow clipping** — character shadow có thể nằm bên dưới platform nếu standing trên platform (em chưa fix shadow rendering logic)
4. **Chapter banner position** — banner ở y=210, có thể overlap với character portraits ở y=40 trong frame đầu
5. **Cam edge jump** — khi reach world edge (x=3840), camera clamp có thể tạo pop animation
6. **Font load delay** — Be Vietnam Pro từ Google Fonts có thể flash with fallback font 200-500ms

---

## 💙 FINAL NOTE

Game này là món quà bố Lukas tự tay build cho 3 con. Quality matters. Không vội, không tắt nước.

*"Anh em phải luôn yêu thương nhau."*

— bố Quang

---

**🌿 END OF PHASE 3 HANDOFF**
