# 📦 THREE LITTLE WINGS — PHASE 4 HANDOFF

**Ngày tạo:** Apr 20, 2026 (phiên 3)
**Session trước:** Phase 2 static audit + 14 bug fixes
**Session này đã làm:** Runtime test Ch1, fix 1 critical bug, build Chapter 2 hoàn chỉnh

---

## 🎯 TÓM TẮT PHIÊN NÀY

### Bug runtime phát hiện và fix

**BUG CRITICAL (B15):** `afterDelay` trigger interrupt intro cutscene
- **Triệu chứng:** `tutorial_switch` (afterDelay: 6500ms) fire vào giữa intro cutscene (17s), replace script đang chạy → `releaseInput` không bao giờ chạy → `inputLocked=true` vĩnh viễn → player bị kẹt không di chuyển được.
- **Root cause:** Timer trong `_checkTriggers` dùng `performance.now()` real clock, bắt đầu từ khi scene enter, không quan tâm input có bị lock hay không.
- **Fix:** `js/scenes/gameplay.js` — chỉ bắt đầu đếm timer khi `!this.inputLocked`. Timer không tick trong thời gian cutscene.

### Runtime test Ch1 — kết quả
| Item | Kết quả |
|------|---------|
| Boot + loading all JS files | ✅ 200 OK |
| Main menu: title, button, dedication | ✅ |
| GameplayScene load Ch1 | ✅ |
| intro_scene không bị interrupt | ✅ (sau fix B15) |
| inputLocked=false sau intro | ✅ |
| Movement (← →) | ✅ |
| Character switching (1/2/3) | ✅ |
| Flower collection | ✅ |
| Ending trigger x=3700 | ✅ |
| ChapterEndScene | ✅ "Hết Chương 1 Bìa Rừng" |
| DemoEndScene | ✅ "Kết thúc bản demo" |

### Chapter 2 Suối Đá — đã build và test
**Engine features mới:**
| Feature | Cmd | Mô tả |
|---------|-----|-------|
| Dynamic platforms | `showPlatform id`, `hidePlatform id` | Toggle visibility of platforms defined in `chapter.dynamicPlatforms` |
| Boulder prop | `spawnProp` với `prop:'boulder'` | Hold Z → Chòe đẩy boulder at walk speed. Khi cross `triggerX` → fire event |
| Hand-holding | `attachChars parent child`, `detachChars child` | Child snaps beside parent với lerp, share facing |

**chapter2.js runtime test:**
| Item | Kết quả |
|------|---------|
| Ch2 load với background suối | ✅ |
| dynamicPlatforms init | ✅ |
| Boulder spawn khi đến trigger zone | ✅ x=850 |
| Chòe hold Z → boulder di chuyển | ✅ +201px/s |
| choe_pushing_rock sprite active | ✅ |
| Boulder cross triggerX → bridge_appears | ✅ |
| Dynamic platform render (stone bridge) | ✅ |
| attachChars → chien follow cucu | ✅ |
| Toàn bộ story beats (dialog, narration) | ✅ |

---

## 📁 FILES ĐÃ THAY ĐỔI PHIÊN NÀY

```
js/scenes/gameplay.js    ✏️ Fix B15 + engine features Ch2
js/chapters/chapter2.js  🆕 Chapter 2 data
game.js                  ✏️ Import CHAPTER_2
sw.js                    ✏️ Cache v1.3, thêm chapter2.js vào SHELL
```

---

## 🔬 TODO PHIÊN TIẾP THEO

### STEP 1 — Push lên repo (Lukas làm)
```bash
cd <path-to-tlw>
git push
```
Vercel auto-deploy → test trên `threelittlewings.tranxuanquang.vn`

### STEP 2 — Test Ch2 trên mobile thật
- Touch buttons visible (wooden Ghibli)
- Tap character portrait → switch
- Hold skill button (right side) → boulder push

### STEP 3 — Build Chapter 3 (Rừng Hoa)
Theo HANDOFF_PHASE3 design:
- Skill mới cho Cúc Cu: **double-jump** (đã có trong engine, chỉ cần dùng)
- Background: `bg_ch3_runghoa`
- Story: ba anh em tìm đường qua rừng hoa, Cúc Cu nhảy lên hái hoa để dẫn đường

### STEP 4 — Sprite placeholders cần thêm
Sprites được dùng trong Ch2 nhưng có thể hiện placeholder đỏ (nếu file không tồn tại):
- `chien_hesitant_back.png`
- `chien_taking_hand_up.png`
- `cucu_reaching_hand_out.png` (có sẵn ✅)
- `choe_pushing_rock.png` (có sẵn ✅)

Kiểm tra console sau khi load xem `[Assets] missing:` warning nào.

---

## ⚠️ KNOWN ISSUES CÒN LẠI

1. **rAF throttle khi tab bị hidden** — Chrome throttle requestAnimationFrame khi extension control tab. Không ảnh hưởng real play (game được focus bình thường).
2. **afterDelay timer dùng performance.now()** — Đã fix cho interrupt case. Nếu player pause game bằng cách hide tab, timer vẫn tích lũy real time. Ít ảnh hưởng vì delay chỉ là tutorial message.
3. **Boulder visual** — Boulder render bằng canvas code đơn giản (ellipse), không dùng sprite. Cần check xem có sprite `boulder_rock.png` không — nếu có, refactor boulder draw dùng sprite.
4. **Ch2 stream visual** — Suối trong background `bg_ch2_suoida` chỉ là art tĩnh. Không có water animation — bình thường cho Ghibli style.

---

## 💙 COMMITS PHIÊN NÀY

```
ed1cdaa  Phase 2 runtime test + bugfix: afterDelay trigger interrupt
4721030  Chapter 2 Suối Đá: boulder push, dynamic platforms, hand-holding
```

*"Anh em phải luôn yêu thương nhau."*
— bố Quang

---
**🌿 END OF PHASE 4 HANDOFF**
