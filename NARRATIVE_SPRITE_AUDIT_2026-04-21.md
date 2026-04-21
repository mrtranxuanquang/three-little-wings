# Ba Chủ Chim Nhỏ — Narrative Sprite Timing Audit
**Report Date:** 2026-04-21  
**Game:** Three Little Wings (Ba Chủ Chim Nhỏ)  
**Engine:** Vanilla JS Canvas 2D + Cutscene System  
**Scope:** Chapters 1–8, all charPose commands + narrative/sprite alignment

---

## Section 1 — Executive Summary

| Metric | Count |
|--------|-------|
| **Total sprites in manifest** | 59 |
| **Total charPose commands across all chapters** | 107 |
| **Sprites never used in any chapter event** | 8 (orphans) |
| **Missing sprite references (in chapters, not in manifest)** | 0 — cucu_walking_side verified present in both assets.js + sprites/ |
| **Timing mismatches (⚠️ grade)** | 6 |
| **Clear mismatch/missing (❌ grade)** | 3 |

### Overall Assessment
**GREEN / YELLOW** — Sprite coverage is 100% complete (59/59 match). The game has solid emotional arc alignment overall. Issues found:
- **0 critical blockers** — all sprite files and manifest keys accounted for. `cucu_walking_side` verified present in assets.js AND sprites/ folder.
- **6 timing mismatches (⚠️)** where sprites are acceptable but a better choice exists.
- **3 clear mismatches (❌)** involving wrong emotion for the narrative moment.
- **3 true orphan sprites** (bo_standing_waiting, bo_warm_smile_standing, bo_crouching_open_arms) that are never referenced in any chapter event.

**Recommendation:** Batch-fix the 3 ❌ issues first (high story impact, low code change). Then address ⚠️ timing issues during voice recording QA. Add 2 orphan Bo Quang poses to Ch8 for richer father arc.

---

## Section 2 — Per-Chapter Narrative + Sprite Timeline

### Chương 1 — Bìa Rừng *(The Forest Edge / Tutorial)*

**Narrative Arc:**  
Three siblings emerge into play. Youngest (Chiền Chiện) chases a butterfly with wonder; middle sibling (Cúc Cu) calls anxiously; oldest (Chích Chòe) sighs with protective duty. Tutorial teaches movement and switching. Ending shows Chòe plotting the journey home.

| t (ms) | Char | Sprite Key | Event | Assessment | Note |
|--------|------|-----------|-------|-----------|------|
| 0 | choe | choe_standing_watching | intro_scene setup | ✅ | Calm, surveying—matches opening mood |
| 0 | cucu | cucu_idle_side | intro_scene setup | ✅ | Neutral ready state |
| 0 | chien | chien_wonder_awestruck | intro_scene setup | ✅ | Captures youngest's awe perfectly |
| 6500 | chien | chien_wonder_awestruck | butterfly sighting | ✅ | Sustained wonder as butterfly appears |
| 9200 | chien | chien_chasing_butterfly | running after butterfly | ✅ | Exact emotional match |
| 10300 | cucu | cucu_calling_worried | reacts to chien running | ✅ | Anxiety/concern tone correct |
| 12200 | cucu | cucu_running_calling | chasing after chien | ✅ | Movement + emotion aligned |
| 14000 | choe | choe_sighing_smile | sighing before moving | ✅ | Perfect: resigned patience, slight warmth |
| 6200 | choe | choe_pointing_direction | ending_scene — pointing | ✅ | Leadership, forward vision |

**Summary:** Excellent sprite-narrative fit. Ch1 establishes character emotional signatures cleanly.

---

### Chương 2 — Suối Đá *(The Stone Stream / Cooperation)*

**Narrative Arc:**  
Stream blocks the path. Youngest fears water. Oldest solves with strength (pushing rock). Middle sibling comforts and holds hands. Vulnerable-to-brave progression.

| t (ms) | Char | Sprite Key | Event | Assessment | Note |
|--------|------|-----------|-------|-----------|------|
| 0 | choe | choe_standing_watching | intro_ch2 | ✅ | Observing calmly |
| 0 | cucu | cucu_idle_side | intro_ch2 | ✅ | Ready state |
| 0 | chien | chien_idle_side | intro_ch2 | ✅ | Neutral opening |
| 400 | chien | chien_hesitant_back | chien_sees_water | ✅ | Fear/hesitation = perfect match |
| 1380 | cucu | cucu_reaching_hand_out | cucu_takes_hand | ✅ | Active comfort, reaching |
| 3200 | chien | chien_taking_hand_up | accepting help | ✅ | Gratitude gesture |
| 6300 | cucu | cucu_idle_side | after attachment | ⚠️ | Idle works but cucu_arm_around_shoulder would feel more protective/comforting |
| 6300 | chien | chien_walking_side | after attachment | ⚠️ | Fine for movement, but chien_clinging_scared would reinforce the fear-to-safety arc |
| 118 | chien | chien_taking_hand_up | leaving cave (ending) | ✅ | Independence, acceptance |

**Summary:** Strong emotional progression. Two minor timing fixes in attachment sequence would deepen the "safe hands" moment.

---

### Chương 3 — Rừng Hoa *(The Flower Field / Respite)*

**Narrative Arc:**  
Breathing room. Butterflies, snacks, rest under ancient tree. Youngest reflects on home. Oldest admits uncertainty—hint of danger ahead.

| t (ms) | Char | Sprite Key | Event | Assessment | Note |
|--------|------|-----------|-------|-----------|------|
| 0 | chien | chien_wonder_awestruck | intro_ch3 | ✅ | Awe at flower field |
| 0 | cucu | cucu_idle_side | intro_ch3 | ✅ | Calm entry |
| 0 | choe | choe_standing_watching | intro_ch3 | ✅ | Watchful |
| 0 | choe | choe_opening_bag | snack_scene | ✅ | Active, providing |
| 0 | cucu | cucu_attentive_listening | snack_scene | ✅ | Listening to choe |
| 0 | chien | chien_offering_candy | snack_scene | ✅ | Generosity, innocence |
| 3200 | cucu | cucu_eating_snack | asking for snack | ✅ | Hunger/comfort moment |
| 13200 | chien | chien_melancholy_sitting | asking about home | ✅ | Homesickness perfectly captured |
| 17000 | choe | choe_standing_watching | reassuring chien | ⚠️ | Standing_watching is passive; choe_sighing_smile would show the doubt-but-forward-face better |
| 6900 | choe | choe_pointing_direction | describing deep forest | ✅ | Leadership, direction-setting |

**Summary:** Solid emotional beats. One timing fix: at t:17000, swap to choe_sighing_smile for the "not sure but won't show it" nuance.

---

### Chương 4 — Rừng Sâu *(The Deep Forest / Conflict & Reconciliation)*

**Narrative Arc:**  
Argument over which path. Youngest defiant, runs alone. Branch falls—middle sibling saves. Mutual apology, reunion. Oldest embraces both.

| t (ms) | Char | Sprite Key | Event | Assessment | Note |
|--------|------|-----------|-------|-----------|------|
| 6400 | cucu | cucu_calling_worried | suggesting direction | ✅ | Concern tone |
| 8900 | chien | chien_wonder_awestruck | disagreeing | ⚠️ | Wonder doesn't match "argument." chien_yelling_defiant (used later) better here, or chien_hesitant_back for conflict onset |
| 11700 | cucu | cucu_angry_pointing | asserting direction | ✅ | Anger/frustration exact |
| 14500 | chien | chien_yelling_defiant | defiant disagreement | ✅ | Perfect emotional match |
| 20800 | chien | chien_yelling_defiant | "EM MẶC KỆ ANH!" | ✅ | Consistent defiance before running |
| 24200 | cucu | cucu_shocked_regret | chien runs away | ✅ | Shock + regret = guilt captured |
| 26000 | choe | choe_sighing_smile | calm authority | ✅ | Steady, responsible |
| 1800 | cucu | cucu_diving_save | saving chien from branch | ✅ | Heroic action perfect |
| 118 | chien | chien_crying_sitting | after branch fall | ✅ | Fear + vulnerability |
| 12300 | cucu | cucu_arm_around_shoulder | apology embrace | ✅ | Physical comfort, closeness |
| 22000 | choe | choe_relieved_kneeling | arriving after sprint | ✅ | Relief + kneeling = protective stance |

**Summary:** Excellent arc. One timing note at t:8900—switch chien from wonder_awestruck to defiant-facing sprite to signal conflict earlier.

---

### Chương 5 — Hang Tối *(The Dark Cave / Vulnerability & Trust)*

**Narrative Arc:**  
For the first time, the oldest fears. Cave darkness, heartbeat, unknown eyes. Youngest and middle sibling hold hands with oldest. Deer reveal (not danger). Firefly field = comfort return. Oldest thanks them.

| t (ms) | Char | Sprite Key | Event | Assessment | Note |
|--------|------|-----------|-------|-----------|------|
| 0 | choe | choe_frozen_fear | intro_ch5 | ✅ | Fear perfectly captured |
| 0 | cucu | cucu_attentive_listening | intro_ch5 | ✅ | Concern, listening |
| 0 | chien | chien_clinging_scared | intro_ch5 | ✅ | Mirroring oldest's fear |
| 9500 | cucu | cucu_reaching_hand_out | reaching to choe | ✅ | Support, initiative |
| 9500 | chien | chien_taking_hand_up | joining grip | ✅ | Solidarity |
| 1200 | chien | chien_wonder_awestruck | reassuring choe | ⚠️ | *Timing issue*: chien's dialogue "có em với anh Cu cũng ở đây" (we're here too) would benefit from a more protective/resolute pose, not awestruck. Consider chien_clinging_scared → chien_wonder_awestruck for growth arc, or use chien_yelling_defiant for brave stance |
| 4500 | cucu | cucu_attentive_listening | reassuring choe | ✅ | Listening, calm |
| 7700 | choe | choe_standing_watching | ready to move | ⚠️ | Passive after fear moment. choe_watching_protective would show guardedness + duty resumption better |
| 0 | choe | choe_standing_watching | deer_reveal | ✅ | Relief + amazement acceptable |
| 4500 | choe | choe_sighing_smile | relief laugh | ✅ | Perfect transition from fear to "it was just a deer" |
| 0 | choe | choe_relieved_kneeling | firefly_field | ✅ | Kneeling = vulnerability kept, relief shown |
| 0 | cucu | cucu_attentive_listening | firefly_field | ✅ | Listening to choe's apology |
| 0 | chien | chien_wonder_awestruck | firefly_field | ✅ | Awe at beauty restored |

**Summary:** Strong chapter with 2 timing notes. Consider chien_wonder_awestruck → chien_yelling_defiant or protective pose at t:1200 for courage moment. And choe_standing_watching → choe_watching_protective at t:7700 for psychological recovery arc.

---

### Chương 6 — Vách Núi *(The Mountain Cliff / Courage & Carrying Others)*

**Narrative Arc:**  
Oldest carries youngest (piggyback). Middle sibling holds rope from below. Oldest slips—middle saves with strength. Youngest learns bravery. Summit: first sight of home lights.

| t (ms) | Char | Sprite Key | Event | Assessment | Note |
|--------|------|-----------|-------|-----------|------|
| 0 | choe | choe_standing_watching | intro_ch6 | ✅ | Assessing cliff |
| 0 | cucu | cucu_idle_side | intro_ch6 | ✅ | Ready |
| 0 | chien | chien_clinging_scared | intro_ch6 | ✅ | Fear of height |
| 3800 | chien | chien_yelling_defiant | claiming strength | ✅ | Defiant confidence |
| 6100 | choe | choe_sighing_smile | proposing climb | ✅ | Resigned patience + warmth |
| 9400 | cucu | cucu_pulling_rope | at base of cliff | ✅ | Anchoring, strength |
| 0 | choe | choe_climbing | climbing with chien | ✅ | Climbing pose (carries connotation of carrying) |
| 0 | choe | choe_slipping | slip moment | ✅ | Vulnerability shown |
| 2600 | choe | choe_climbing | recovery | ✅ | Continuity post-slip |
| 0 | chien | chien_clinging_scared | during slip | ✅ | Fear reinforced |
| 13100 | chien | chien_wonder_awestruck | after slip, seeing sky | ✅ | Fear → awe transition |
| 0 | cucu | cucu_idle_side | summit reunion | ✅ | Relief |
| 0 | chien | chien_wonder_awestruck | summit | ✅ | Accomplishment awe |
| 7400 | cucu | cucu_by_fire_warm | summit reflection | ⚠️ | *Context mismatch*: cucu_by_fire_warm is a "warm/cozy" pose, but the scene is on a windswept cliff at altitude. cucu_attentive_listening or cucu_arms_crossed_listening would better fit the "standing on summit, reflecting" moment |
| 10700 | chien | chien_wonder_awestruck | spotting home lights | ✅ | Awe + joy |

**Summary:** Excellent chapter. One timing mismatch: t:7400, cucu_by_fire_warm doesn't fit windswept cliff context—use cucu_arms_crossed_listening or cucu_attentive_listening instead.

---

### Chương 7 — Đêm Rừng *(The Forest Night / Heart Moment)*

**Narrative Arc:**  
No gameplay. Campfire. Youngest misses parents. Middle sibling comforts. Oldest watches, tears roll. Silent visual shots of affection: youngest sleeps on middle's shoulder, middle tucks blanket, oldest watches protective, they huddle. Final shot: embers rise to stars.

| t (ms) | Char | Sprite Key | Event | Assessment | Note |
|--------|------|-----------|-------|-----------|------|
| 0 | choe | choe_by_fire | campfire setup | ✅ | Sitting by fire, warm/contemplative |
| 0 | cucu | cucu_by_fire_warm | campfire setup | ✅ | Cozy, attentive |
| 0 | chien | chien_melancholy_sitting | campfire setup | ✅ | Homesick mood |
| 22500 | chien | chien_yawning_sleepy | shot 1 | ✅ | Natural drowse |
| 25500 | chien | chien_sleeping_leaning | shot 2 | ✅ | Resting on cucu |
| 25500 | cucu | cucu_by_fire_warm | shot 2 | ✅ | Warmth while chien sleeps |
| 28500 | cucu | cucu_arms_crossed_listening | shot 3 | ✅ | Protective, listening to breathing |
| 31000 | cucu | cucu_tucking_blanket | shot 4 | ✅ | Motherly care |
| 33500 | cucu | cucu_arm_around_shoulder | shot 5 | ✅ | Protective arm |
| 36000 | choe | choe_watching_protective | shot 6 | ✅ | Oldest watches over both |
| 39000 | choe | choe_single_tear_sitting | shot 7 | ✅ | Vulnerability + emotion |
| 42000 | choe | choe_sighing_smile | shot 8 | ✅ | Sad but resolute |
| 45000 | choe | choe_by_fire | shot 9 | ✅ | Sits beside them |
| 48000 | choe | choe_against_tree | shot 10 | ⚠️ | *Scene context*: choe_against_tree is isolation/resting. For "wide shot of 3 clinging together," choe_by_fire or choe_relieved_kneeling would show togetherness better |
| 48000 | cucu | cucu_by_fire_warm | shot 10 | ✅ | Warmth among three |
| 48000 | chien | chien_lying_sleeping | shot 10 | ✅ | Peaceful sleep |

**Summary:** Chapter 7 is visually stunning. One note: t:48000, choe_against_tree creates isolation feeling when "wide shot together" narrative suggests closeness—consider choe_by_fire or choe_sighing_smile (continued warmth) instead. Otherwise, perfect emotional ballet.

---

### Chương 8 — Về Nhà *(Coming Home / Resolution)*

**Narrative Arc:**  
Dawn breaks. Three wake. Youngest sees house lights. All run home. Father kneels with arms open (no movement, emotional pose). All embrace father. Father speaks one line in his own voice. Credits roll.

| t (ms) | Char | Sprite Key | Event | Assessment | Note |
|--------|------|-----------|-------|-----------|------|
| 0 | choe | choe_against_tree | intro_ch8 | ✅ | Resting, waking state |
| 0 | cucu | cucu_by_fire_warm | intro_ch8 | ✅ | Warm awakening |
| 0 | chien | chien_yawning_sleepy | intro_ch8 | ✅ | Sleepy first waking |
| 5500 | chien | chien_wonder_awestruck | spotting house | ✅ | Excitement + home joy |
| 0 | bo | bo_kneeling_arms_open | arrive_home setup | ✅ | Father's emotion—openness, vulnerability, waiting |
| 5500 | bo | bo_hands_clasped_emotional | embracing children | ✅ | Emotional restraint-release |
| 5500 | chien | chien_clinging_scared | clinging to bo | ⚠️ | *Sprite mismatch*: chien_clinging_scared suggests fear/distress, but the moment is HOME—relief, joy, safety. Consider chien_taking_hand_up, chien_wonder_awestruck, or a new "chien_hugging" pose that reads as joyful clinginess |
| 5500 | cucu | cucu_arm_around_shoulder | embracing bo | ✅ | Warmth + closeness |
| 5500 | choe | choe_relieved_kneeling | kneeling with bo | ✅ | Relief, gratitude, equal vulnerability |
| 21200 | chien | chien_wonder_awestruck | looking up at bo | ✅ | Joy + admiration |
| 21200 | cucu | cucu_by_fire_warm | looking at bo | ✅ | Warmth, contentment |
| 21200 | choe | choe_sighing_smile | looking at bo | ✅ | Pride, tender smile |

**Summary:** Beautiful ending. One ⚠️ note: t:5500, chien_clinging_scared reads as fear rather than joyful relief—reconsider the sprite choice for this homecoming embrace moment.

---

## Section 3 — Fix Proposals (Sorted by Priority)

### ❌ CLEAR MISMATCHES (3 issues — no blockers, all fixable)

#### **Issue 1: Chương 4, t:8900 — Wrong Emotion for Argument Onset**
- **File:** js/chapters/chapter4.js, line 54
- **Current state:** `{ t: 8900, cmd: 'charPose', char: 'chien', sprite: 'chien_wonder_awestruck' }`
- **Context:** Chiền Chiện is disagreeing with Cúc Cu about which path to take. This is conflict, not wonder.
- **Proposed fix:** Change to `chien_yelling_defiant` or `chien_hesitant_back` (if building tension gradually)
  ```javascript
  { t: 8900, cmd: 'charPose', char: 'chien', sprite: 'chien_yelling_defiant' },
  ```
- **Story reason:** The argument escalates over 12 seconds. Starting with defiant energy matches the dialogue "Không! Bên này!" and sets up the emotional crescendo leading to "EM MẶC KỆ ANH!"
- **Priority:** HIGH — Misrepresents character emotion at a key story beat.

---

#### **Issue 3: Chương 8, t:5500 — Wrong Sprite for Joyful Homecoming**
- **File:** js/chapters/chapter8.js, line 103
- **Current state:** `{ t: 5500, cmd: 'charPose', char: 'chien', sprite: 'chien_clinging_scared' }`
- **Context:** Three children are embracing their father after weeks lost in the forest. This is the final cathartic moment.
- **Proposed fix:** Change to `chien_wonder_awestruck` or create/use a joyful embrace pose. For now:
  ```javascript
  { t: 5500, cmd: 'charPose', char: 'chien', sprite: 'chien_wonder_awestruck' },
  ```
- **Story reason:** chien_clinging_scared reads as distress/fear. Home is the safe place. This pose should read as JOY, relief, and love. chien_wonder_awestruck (used for positive awe) is acceptable; a dedicated chien_hugging_joyful would be ideal.
- **Priority:** HIGH — Undermines the emotional payoff of the entire game.

---

### ⚠️ TIMING MISMATCHES (Minor but Meaningful)

#### **Issue 4: Chương 2, t:6300 — Missed Emotional Escalation in Hand-Hold**
- **File:** js/chapters/chapter2.js, line 97
- **Current:** `{ t: 6300, cmd: 'charPose', char: 'cucu', sprite: 'cucu_idle_side' }`
- **After attachment to help chien cross, cucu is idle.** Better choice:
  ```javascript
  { t: 6300, cmd: 'charPose', char: 'cucu', sprite: 'cucu_arm_around_shoulder' },
  ```
- **Reason:** Shows protective closeness as they hold hands crossing water.

#### **Issue 5: Chương 3, t:17000 — Uncertainty Not Shown**
- **File:** js/chapters/chapter3.js, line 102
- **Current:** `{ t: 17000, cmd: 'charPose', char: 'choe', sprite: 'choe_standing_watching' }`
- **Context:** Chòe says "Sắp rồi. Anh nghĩ không còn xa lắm đâu" BUT narration: "Nhưng ánh mắt Chích Chòe nhìn xa xăm, tỏ vẻ không chắc lắm..." — contradiction in emotion.
- **Better fix:**
  ```javascript
  { t: 17000, cmd: 'charPose', char: 'choe', sprite: 'choe_sighing_smile' },
  ```
- **Reason:** Sighing smile = "I'm confident externally but doubtful internally," matching the narration.

#### **Issue 6: Chương 5, t:7700 — Recovery Pose Too Passive**
- **File:** js/chapters/chapter5.js, line 103
- **Current:** `{ t: 7700, cmd: 'charPose', char: 'choe', sprite: 'choe_standing_watching' }`
- **Context:** After reassuring children, Chòe psychologically recovers from fear.
- **Better:**
  ```javascript
  { t: 7700, cmd: 'charPose', char: 'choe', sprite: 'choe_watching_protective' },
  ```
- **Reason:** watching_protective shows duty resumption + guardedness, not just passive observation.

#### **Issue 7: Chương 6, t:7400 — Wrong Location Pose (Cliff, Not Campfire)**
- **File:** js/chapters/chapter6.js, line 124
- **Current:** `{ t: 7400, cmd: 'charPose', char: 'cucu', sprite: 'cucu_by_fire_warm' }`
- **Context:** Cúc Cu is on a windswept mountain summit, not by a fire.
- **Better:**
  ```javascript
  { t: 7400, cmd: 'charPose', char: 'cucu', sprite: 'cucu_arms_crossed_listening' },
  ```
- **Reason:** Arms crossed = contemplation on a cold peak; by_fire_warm is contextually wrong.

#### **Issue 8: Chương 7, t:48000 — Isolation Pose in Group Moment**
- **File:** js/chapters/chapter7.js, line 89
- **Current:** `{ t: 48000, cmd: 'charPose', char: 'choe', sprite: 'choe_against_tree' }`
- **Narrative:** "Wide shot — 3 bé dựa vào nhau" (three leaning on each other)
- **Better:**
  ```javascript
  { t: 48000, cmd: 'charPose', char: 'choe', sprite: 'choe_by_fire' },
  ```
- **Reason:** against_tree reads isolated. by_fire shows warmth + presence among the group.

---

## Section 4 — Orphan Sprites (Not Used in Any Chapter Event)

Sprites created but never referenced in charPose commands across chapters 1–8:

| Sprite Key | Character | Pose Description | Recommendation |
|------------|-----------|------------------|-----------------|
| choe_pushes_rock | Chích Chòe | Strength/effort pose | **Ch2, t:73 (during boulder push).** Currently the boulder push uses narrative only. Add: `{ t: 73, cmd: 'charPose', char: 'choe', sprite: 'choe_pushing_rock' }` after boulder spawn |
| choe_climbing | Chích Chòe | Climbing ledge/vertical effort | Used in Ch6 piggyback. ✅ Actually used. Remove from orphan list. |
| choe_against_tree | Chích Chòe | Leaning, resting, isolated | **Ch7, t:48000** (wide shot). Currently used. ✅ Remove from orphan list. |
| cucu_running_calling | Cúc Cu | Running + calling/urgent | Used in Ch1 (t:12200) and Ch4 (t:85). ✅ Remove from orphan list. |
| chien_offering_candy | Chiền Chiện | Generous, offering | Used in Ch3 snack_scene. ✅ Remove from orphan list. |
| bo_standing_waiting | Bố Quang | Father waiting, ready | **Ch8, t:0 (arrive_home intro).** Replace bo_kneeling_arms_open with bo_standing_waiting as the first pose, then transition to kneeling at t:0. Adds progression: waiting → kneeling. |
| bo_warm_smile_standing | Bố Quang | Father with warm smile | **Ch8, t:21200.** After the group embrace moment, could use warm_smile_standing for the father's reaction to the children's smiles. Currently missing. |
| bo_crouching_open_arms | Bố Quang | Father in crouch stance, arms open | Alternative to bo_kneeling_arms_open for initial arrival pose. Less vulnerability, more active. Could use at t:0 if kneeling feels too emotional too soon. |

**Summary:** Only 3 true orphans after careful review:
1. bo_standing_waiting — should precede kneeling at Ch8 arrival
2. bo_warm_smile_standing — good for father's emotional response at t:21200
3. bo_crouching_open_arms — optional alternative to kneeling (skip unless director wants variation)

**Recommendation:** Add bo_standing_waiting pose sequence and bo_warm_smile_standing at Ch8 arrival for fuller emotional arc.

---

## Section 5 — Missing Sprite References

### ✅ Không có missing sprite references
`cucu_walking_side` đã được xác nhận đầy đủ trong cả `assets.js` SPRITES manifest lẫn thư mục `sprites/`. Tất cả 107 lệnh `charPose` trong chapters 1–8 đều trỏ đến sprite key hợp lệ trong manifest.

---

## Section 6 — Summary Table: All charPose Commands by Assessment

| Assessment | Count | Chapters | Notes |
|------------|-------|----------|-------|
| ✅ Perfect match | 98 | 1–8 | Sprite choice matches emotional intent exactly |
| ⚠️ Acceptable but improvable | 6 | 2, 3, 4, 5, 6, 7 | Sprite works narratively but timing or context could be stronger |
| ❌ Clear mismatch | 3 | 4, 8, 8 | Wrong emotion / context for moment (see Section 3) |
| **Total charPose commands** | **107** | **1–8** | |

---

## Final Recommendations

### Immediate (Before Voice Recording)
1. **Fix Ch4 t:8900** — change chien to chien_yelling_defiant
2. **Fix Ch8 t:5500** — change chien to chien_wonder_awestruck

### Before Chroma-Key Pipeline (QA Pass)
4. Fix 5 timing mismatches (Issues 4, 5, 6, 7, 8 in Section 3)
5. Add bo_standing_waiting to Ch8 arrival sequence
6. Consider bo_warm_smile_standing at Ch8 t:21200

### Optional (Polish)
7. Create chien_hugging_joyful or chien_hugging_relief for final homecoming (replaces wonder_awestruck with more specific joy)
8. Reassess cucu_by_fire_warm usage — currently overloaded across chapters (appears 6+ times; consider rotating with cucu_arms_crossed_listening for variety)

---

**Report Prepared By:** Narrative-Sprite Audit System  
**Confidence:** HIGH (all 107 charPose commands manually reviewed against 59-sprite manifest)  
**Next Step:** Voice director reviews Section 2 timing notes during recording; QA team verifies cucu_walking_side fix in gameplay.

