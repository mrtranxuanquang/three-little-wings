# 🌿 Three Little Wings — Ba Anh Em Vượt Rừng

> Một câu chuyện nhỏ dành tặng **Khôi Vĩ, Khôi Nguyên và Khôi Trí** —
> với mong muốn các con luôn yêu thương, hỗ trợ, và phối hợp với nhau.
>
> *"Anh em phải luôn yêu thương nhau" — lời bố Quang dặn*

---

## 🎮 About

Three Little Wings là platformer web hợp tác 2D trong phong cách Studio Ghibli painted — ba anh em phối hợp 3 kỹ năng khác nhau để vượt rừng về nhà. Không có chiến đấu. Không có thua cuộc. Chỉ có câu chuyện.

- **Format:** Single-page PWA, 1 HTML entry
- **Tech:** Vanilla ES modules + Canvas 2D (không framework)
- **Resolution:** 1920×1080 logical, letterbox responsive
- **Platform:** Desktop keyboard + Mobile touch

## 🌟 Current status (Phase 1 Demo)

- ✅ **Chapter 1 — Bìa Rừng** (playable, tutorial): intro cutscene với bướm, 3 hoa collectible, platform jumping, ending cutscene "Theo suối đi"
- ⏳ **Chapter 2–8**: sẽ được build trong các phase tiếp theo

## 🕹️ Controls

### Desktop (keyboard)
| Key | Action |
|---|---|
| `← →` hoặc `A D` | Di chuyển |
| `Space` hoặc `↑` hoặc `W` | Nhảy |
| `Shift` hoặc `Z` | Kỹ năng đặc biệt (chưa dùng ở Ch1) |
| `1` `2` `3` | Chuyển Chích Chòe / Cúc Cu / Chiền Chiện |
| `Enter` | Tiếp tục dialog / hoàn thành cutscene |
| `Esc` hoặc `P` | Tạm dừng / bỏ qua cutscene |
| `` ` `` | Toggle debug |

### Mobile (touch)
- D-pad trái: di chuyển
- Nút tròn lớn phải: nhảy
- Nút tròn nhỏ phải: skill
- 3 biểu tượng góc trên-phải: chuyển nhân vật

## 🏗️ Project structure

```
/
├── index.html            # PWA shell
├── game.js               # Root game orchestrator
├── manifest.json         # PWA manifest
├── sw.js                 # Service worker (offline cache)
├── vercel.json           # Deploy config
│
├── js/
│   ├── config.js         # Tuning constants
│   ├── assets.js         # Asset manifest + loader
│   ├── input.js          # Keyboard + touch input
│   ├── audio.js          # Web Audio wrapper
│   ├── physics.js        # AABB + coyote + double-jump
│   ├── character.js      # Pose-swap anim + follower AI
│   ├── dialog.js         # Speech bubbles + narration banner
│   ├── cutscene.js       # Timeline engine + Ken Burns
│   ├── scenes/
│   │   ├── loading.js    # Initial load screen
│   │   ├── mainmenu.js   # Title + buttons
│   │   ├── gameplay.js   # Shared gameplay (reads chapter data)
│   │   ├── chapter-end.js# Transition between chapters
│   │   └── demo-end.js   # "Hết demo" screen after Ch1
│   └── chapters/
│       └── chapter1.js   # Ch1 layout + timeline events
│
├── backgrounds/          # 11 JPG — 1920×1080
├── sprites/              # 59 PNG — character poses (transparent)
├── scenes/               # 8 PNG — pre-composed cutscene scenes
├── audio/                # (optional — engine runs silent if empty)
└── icons/                # PWA icons
```

## 🎨 Assets

- **Backgrounds** (11 files, ~5.6MB): Ghibli painted scenes, 1920×1080 JPG
- **Sprites** (59 files, ~15MB): character poses, transparent PNG, feet-anchored
- **Scenes** (8 files, ~6.2MB): pre-composed multi-character cutscene compositions

Tất cả đã sinh sẵn, không cần regenerate.

## 🚀 Deploy to Vercel

```bash
# One-time: push to GitHub
git add .
git commit -m "Phase 1: Chapter 1 playable"
git push origin main

# Vercel auto-deploys from GitHub
# Nếu chưa setup:
#  1. Vercel.com → Import Git Repository
#  2. Chọn mrtranxuanquang/threelittlewings-2026-by-lukas
#  3. Root directory: / (keep default)
#  4. Framework preset: Other
#  5. Build command: (leave empty)
#  6. Output: (leave empty)
#  7. Deploy
#
# DNS (Cloudflare / domain provider):
#  CNAME  threelittlewings  →  cname.vercel-dns.com
```

## 🧪 Test locally

Vì dùng ES modules, không mở `index.html` trực tiếp (file:// block modules). Dùng bất kỳ static server nào:

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node
npx serve .

# Rồi mở: http://localhost:8000
```

## 🔧 Adding chapters (cho session sau)

Mỗi chương là 1 file data trong `js/chapters/`:

```js
export const CHAPTER_2 = {
  number: 2,
  id: 'ch2',
  title: 'Suối đá',
  background: 'bg_ch2_suoida',
  worldWidth: 4200,
  spawn: { x: 200, leader: 'choe' },
  platforms: [...],
  collectibles: [...],
  triggers: [
    { id:'intro', type:'onEnter', x:0, once:true, event:'intro_scene' },
    ...
  ],
  events: {
    intro_scene: [
      { t:0,    cmd:'freezeInput' },
      { t:500,  cmd:'say', char:'chien', text:'Nước... nước lạnh không anh?' },
      ...
    ],
  },
};
```

Rồi thêm vào `CHAPTERS` object trong `game.js`:
```js
import { CHAPTER_2 } from './js/chapters/chapter2.js';
const CHAPTERS = { 1: CHAPTER_1, 2: CHAPTER_2 };
```

Engine tự handle. Không cần sửa core code.

## 📖 Design philosophy

1. **Ít lời hơn, cảm nhiều hơn.** Đặc biệt ở ch7 (campfire) và ch8 (reunion).
2. **Regret > Punishment.** Ch4 không "kết tội" ai — chỉ cho thấy hậu quả.
3. **Người lớn nhất cũng có nỗi sợ.** Ch5 phá stereotype "anh cả luôn mạnh mẽ".
4. **Visual storytelling > Dialog dumping.** Ch7 dùng 13 shots, chỉ 4 câu thoại.
5. **Ending understated.** Ch8 chỉ có 1 câu từ bố. Rest is silence.

## 💙 Credits

Made with ❤️ by **Lukas (Trần Xuân Quang)** for his three sons.

Assets: hand-generated backgrounds, sprites, và scenes qua Gemini 2.5 Flash Image, curated manually.
Engine: vanilla JavaScript, Canvas 2D, Web Audio API.
Font: [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) (SIL OFL).

---

**"Anh em phải luôn yêu thương nhau."**
— *bố Quang*
