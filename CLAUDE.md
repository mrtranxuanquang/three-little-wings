# CLAUDE.md — Three Little Wings Project Context

## What is this project
Web-based narrative game built as a gift from bố Quang (Lukas) for his 3 sons —
Khôi Vĩ (Chích Chòe, 11yo), Khôi Nguyên (Cúc Cu, 8yo), Khôi Trí (Chiền Chiện, 6yo).
A 2D platformer/storybook hybrid: 3 bé vượt rừng về nhà, learn to help each other.
Engine is hand-rolled vanilla JS (no frameworks), canvas 2D renderer.

Deployed at: https://threelittlewings.tranxuanquang.vn (Vercel auto-deploy from main branch)

## Current status (Apr 20, 2026)
Phase 1 (architecture + Ch1 playable) shipped. Phase 2 session 1 did static audit,
fixed 14 bugs. This is start of Phase 2 session 2: runtime test Ch1, then build Ch2-8.

Read HANDOFF_PHASE3.md for full details on what was fixed and what's next.

## Project structure
- `index.html` — PWA shell, Be Vietnam Pro font, rotate-hint
- `game.js` — Game root, main loop, scene manager, touch button layout
- `sw.js` — Service worker (cache shell + assets for offline)
- `js/` — Engine modules (see file list below)
- `js/chapters/chapterN.js` — chapter data files (ONLY ch1 exists)
- `js/scenes/*.js` — scene classes (loading, mainmenu, gameplay, chapter-end, demo-end)
- `backgrounds/` (11 JPG 1920×1080), `sprites/` (59 PNG feet-anchored), `scenes/` (8 pre-composed PNG)
- `audio/` — mostly empty, engine plays silent if files missing

## Engine architecture — IMPORTANT
**Chapter-as-data pattern**: each chapter is a data object, not a class.
Engine (`gameplay.js`) is an interpreter that reads data + executes timeline events.
When building Ch2-8, COPY template from chapter1.js, don't create new classes.

**Only modify engine** when a chapter legitimately needs a feature that doesn't exist yet
(e.g. Ch2 needs pushRock + showPlatform). When you do modify engine, note it in handoff.

## Cmd vocabulary
Commands supported in timelines — see gameplay.js `_execGameplayCmd` for the switch.
Adding a new cmd: add a case + document behavior in the block comment above that fn.

Current: freezeInput, releaseInput, setLeader, faceChar, moveChar, charState, charPose,
charTeleport, cameraTo, cameraShake, say, narrate, bgm, sfx, spawnProp, removeProp,
goToChapter, showTransition, callback.

Cutscene-specific (auto-delegated when timeline has `scene` or `crossfade`):
scene, crossfade, kenBurns, fadeToBlack, fadeFromBlack, wait, end.

## Hard rules for Claude Code
1. **NEVER paste API keys or secrets into code or commits.** All audio is local files,
   no API auth needed for anything.

2. **Always test runtime before declaring a fix works.** Use Playwright/Puppeteer if
   available, or serve locally with `python3 -m http.server 8000` and report what you
   observed. Static analysis is not sufficient for this project — past bugs slipped
   through `node --check` + grep audits.

3. **Don't push to GitHub without asking.** Lukas pushes manually. Claude can stage
   + commit locally; wait for explicit approval before `git push`.

4. **Bump SW cache version** (`sw.js` CACHE_NAME) whenever you modify any cached file.
   Otherwise users' browsers serve stale code.

5. **No child inappropriate content.** This game is for a 6-year-old. Keep all dialog,
   visuals, and behaviors gentle. When in doubt, ask Lukas.

6. **Ghibli tone.** Warm, unhurried, emotional. Palette: cream `#f5ead0`, amber
   `#d4a574`, forest `#2d3a2f`, red `#c94a42`, sky blue `#6b9fd1`. Font Be Vietnam Pro.

## Workflow preferred
1. Before coding: read the relevant module(s) end-to-end, not just the line in question.
2. Make changes.
3. `node --check` all modified JS files.
4. Serve locally, smoke-test with browser.
5. If visuals changed: screenshot or describe.
6. Commit with clear message. Don't push.
7. Update handoff doc if engine features changed.

## Next up (this session)
See HANDOFF_PHASE3.md "TODO PHIÊN NÀY" section:
1. Runtime test Ch1 against checklist
2. Fix any bugs discovered
3. Build Chapter 2 (Suối đá) — skill "đẩy đá" = hold Z → boulder rolls at char speed

## Contact
Lukas (bố Quang) owns product decisions. When uncertain on tone, visual feel, or
whether to add features, ask — don't guess.

*"Anh em phải luôn yêu thương nhau."* — the core message of the game.
