// Three Little Wings — Asset manifest & loader

// BACKGROUNDS (11) — JPG 1920x1080
export const BACKGROUNDS = {
  bg_mainmenu:    'backgrounds/bg_mainmenu.jpg',
  bg_credits:     'backgrounds/bg_credits.jpg',
  bg_ch1_biaurng: 'backgrounds/bg_ch1_biaurng.jpg',
  bg_ch2_suoida:  'backgrounds/bg_ch2_suoida.jpg',
  bg_ch3_runghoa: 'backgrounds/bg_ch3_runghoa.jpg',
  bg_ch4_rungsau: 'backgrounds/bg_ch4_rungsau.jpg',
  bg_ch5_hangtoi: 'backgrounds/bg_ch5_hangtoi.jpg',
  bg_ch5_domdom:  'backgrounds/bg_ch5_domdom.jpg',
  bg_ch6_vachnui: 'backgrounds/bg_ch6_vachnui.jpg',
  bg_ch7_demrung: 'backgrounds/bg_ch7_demrung.jpg',
  bg_ch8_venha:   'backgrounds/bg_ch8_venha.jpg',
};

// SPRITES (59) — transparent PNG, feet-anchored
// anchor [x, y] in normalized sprite-local coords (0..1)
const FEET_ANCHOR = [0.5, 0.98]; // slight lift for visual padding

function sp(file) {
  return { path: `sprites/${file}`, anchor: FEET_ANCHOR };
}

export const SPRITES = {
  // Chích Chòe (20)
  choe_idle_side:            sp('choe_idle_side.png'),
  choe_walking_side:         sp('choe_walking_side.png'),
  choe_running_side:         sp('choe_running_side.png'),
  choe_jumping:              sp('choe_jumping.png'),
  choe_landing:              sp('choe_landing.png'),
  choe_pointing_direction:   sp('choe_pointing_direction.png'),
  choe_pushing_rock:         sp('choe_pushing_rock.png'),
  choe_climbing:             sp('choe_climbing.png'),
  choe_slipping:             sp('choe_slipping.png'),
  choe_opening_bag:          sp('choe_opening_bag.png'),
  choe_against_tree:         sp('choe_against_tree.png'),
  choe_by_fire:              sp('choe_by_fire.png'),
  choe_frozen_fear:          sp('choe_frozen_fear.png'),
  choe_relieved_kneeling:    sp('choe_relieved_kneeling.png'),
  choe_single_tear_sitting:  sp('choe_single_tear_sitting.png'),
  choe_watching_protective:  sp('choe_watching_protective.png'),
  choe_sighing_smile:        sp('choe_sighing_smile.png'),
  choe_standing_watching:    sp('choe_standing_watching.png'),

  // Cúc Cu (19)
  cucu_idle_side:            sp('cucu_idle_side.png'),
  cucu_walking_side:         sp('cucu_walking_side.png'),
  cucu_running_side:         sp('cucu_running_side.png'),
  cucu_double_jump:          sp('cucu_double_jump.png'),
  cucu_landing:              sp('cucu_landing.png'),
  cucu_reaching_hand_out:    sp('cucu_reaching_hand_out.png'),
  cucu_pulling_rope:         sp('cucu_pulling_rope.png'),
  cucu_running_calling:      sp('cucu_running_calling.png'),
  cucu_calling_worried:      sp('cucu_calling_worried.png'),
  cucu_diving_save:          sp('cucu_diving_save.png'),
  cucu_shocked_regret:       sp('cucu_shocked_regret.png'),
  cucu_angry_pointing:       sp('cucu_angry_pointing.png'),
  cucu_attentive_listening:  sp('cucu_attentive_listening.png'),
  cucu_arms_crossed_listening: sp('cucu_arms_crossed_listening.png'),
  cucu_arm_around_shoulder:  sp('cucu_arm_around_shoulder.png'),
  cucu_eating_snack:         sp('cucu_eating_snack.png'),
  cucu_tucking_blanket:      sp('cucu_tucking_blanket.png'),
  cucu_by_fire_warm:         sp('cucu_by_fire_warm.png'),

  // Chiền Chiện (19)
  chien_idle_side:           sp('chien_idle_side.png'),
  chien_walking_side:        sp('chien_walking_side.png'),
  chien_running_side:        sp('chien_running_side.png'),
  chien_jumping:             sp('chien_jumping.png'),
  chien_shrunk_tiny:         sp('chien_shrunk_tiny.png'),
  chien_chasing_butterfly:   sp('chien_chasing_butterfly.png'),
  chien_hesitant_back:       sp('chien_hesitant_back.png'),
  chien_offering_candy:      sp('chien_offering_candy.png'),
  chien_clinging_scared:     sp('chien_clinging_scared.png'),
  chien_crying_sitting:      sp('chien_crying_sitting.png'),
  chien_yelling_defiant:     sp('chien_yelling_defiant.png'),
  chien_wonder_awestruck:    sp('chien_wonder_awestruck.png'),
  chien_melancholy_sitting:  sp('chien_melancholy_sitting.png'),
  chien_yawning_sleepy:      sp('chien_yawning_sleepy.png'),
  chien_eating_cookie:       sp('chien_eating_cookie.png'),
  chien_sleeping_leaning:    sp('chien_sleeping_leaning.png'),
  chien_lying_sleeping:      sp('chien_lying_sleeping.png'),
  chien_taking_hand_up:      sp('chien_taking_hand_up.png'),

  // Bố Quang (6)
  bo_standing_waiting:       sp('bo_standing_waiting.png'),
  bo_kneeling_arms_open:     sp('bo_kneeling_arms_open.png'),
  bo_warm_smile_standing:    sp('bo_warm_smile_standing.png'),
  bo_hands_clasped_emotional: sp('bo_hands_clasped_emotional.png'),
  bo_crouching_open_arms:    sp('bo_crouching_open_arms.png'),
  // Cảnh ôm — 4 bố con trong 1 sprite duy nhất (ch8 arrive_home)
  bo_scene_father_hugging_all: sp('bo_scene_father_hugging_all.png'),
};

// SCENES (8) — pre-composed full-screen cutscene images
export const SCENES = {
  scene_piggyback_carry:       'scenes/scene_piggyback_carry.png',
  scene_three_holding_hands:   'scenes/scene_three_holding_hands.png',
  scene_cucu_hugging_chien:    'scenes/scene_cucu_hugging_chien.png',
  scene_choe_embracing_both:   'scenes/scene_choe_embracing_both.png',
  scene_three_by_fire:         'scenes/scene_three_by_fire.png',
  scene_three_sleeping_huddled: 'scenes/scene_three_sleeping_huddled.png',
  scene_three_running_home:    'scenes/scene_three_running_home.png',
  scene_father_hugging_all:    'scenes/scene_father_hugging_all.png',
};

// Priority groups — what to load first
export const LOAD_PHASES = {
  // Phase 1: splash + main menu (instant)
  essential: [
    'bg_mainmenu',
    'choe_idle_side', 'cucu_idle_side', 'chien_idle_side',
  ],
  // Phase 2: Chapter 1 playable
  chapter1: [
    'bg_ch1_biaurng',
    'choe_walking_side', 'choe_running_side', 'choe_jumping', 'choe_landing',
    'choe_pointing_direction', 'choe_sighing_smile',
    'cucu_walking_side', 'cucu_running_side', 'cucu_calling_worried',
    'cucu_running_calling', 'cucu_double_jump', 'cucu_landing',
    'chien_walking_side', 'chien_running_side', 'chien_jumping',
    'chien_chasing_butterfly', 'chien_wonder_awestruck',
  ],
  // Later phases: lazy-loaded in background
  later: [
    'bg_ch2_suoida', 'bg_ch3_runghoa', 'bg_ch4_rungsau',
    'bg_ch5_hangtoi', 'bg_ch5_domdom', 'bg_ch6_vachnui',
    'bg_ch7_demrung', 'bg_ch8_venha', 'bg_credits',
  ],
};

// ============================================================
// AssetLoader — promise-based image loader with progress
// ============================================================

export class AssetLoader {
  constructor() {
    this.images = new Map();       // key -> HTMLImageElement
    this.spriteAnchors = new Map();// key -> [ax, ay]
    this.totalRequested = 0;
    this.totalLoaded = 0;
    this.failures = [];
  }

  has(key) { return this.images.has(key); }
  get(key) { return this.images.get(key); }
  getAnchor(key) { return this.spriteAnchors.get(key) || [0.5, 1.0]; }

  /**
   * Load a list of keys. Returns a promise that resolves when all loaded.
   * onProgress(loaded, total) called after each image settles.
   */
  load(keys, onProgress) {
    const list = keys.map(k => this._resolveKey(k)).filter(Boolean);
    this.totalRequested += list.length;

    const promises = list.map(({ key, path, anchor, kind }) =>
      this._loadOne(key, path, anchor, kind).finally(() => {
        this.totalLoaded++;
        if (onProgress) onProgress(this.totalLoaded, this.totalRequested);
      })
    );
    return Promise.all(promises);
  }

  _resolveKey(key) {
    if (BACKGROUNDS[key]) return { key, path: BACKGROUNDS[key], kind: 'bg' };
    if (SPRITES[key])     return { key, path: SPRITES[key].path, anchor: SPRITES[key].anchor, kind: 'sprite' };
    if (SCENES[key])      return { key, path: SCENES[key], kind: 'scene' };
    console.warn(`[AssetLoader] Unknown key: ${key}`);
    return null;
  }

  _loadOne(key, path, anchor, kind) {
    if (this.images.has(key)) return Promise.resolve(this.images.get(key));
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        this.images.set(key, img);
        if (anchor) this.spriteAnchors.set(key, anchor);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`[AssetLoader] ⚠️ Failed to load asset: ${path} (key=${key}, kind=${kind})`);
        this.failures.push({ key, path, kind });
        // Store a null-ish placeholder so we don't retry infinitely
        this.images.set(key, null);
        resolve(null);
      };
      img.src = path;
    });
  }

  /** Report any assets that failed to load. Call after batch loads. */
  reportFailures() {
    if (this.failures.length === 0) return;
    console.warn(`[AssetLoader] ${this.failures.length} asset(s) failed to load:`);
    for (const f of this.failures) {
      console.warn(`  • ${f.kind}: ${f.key} (${f.path})`);
    }
  }

  /** Load all remaining assets in background, no blocking. */
  loadRestInBackground() {
    const all = [
      ...Object.keys(BACKGROUNDS),
      ...Object.keys(SPRITES),
      ...Object.keys(SCENES),
    ];
    const remaining = all.filter(k => !this.images.has(k));
    if (remaining.length === 0) return;
    // Fire-and-forget
    this.load(remaining, null);
  }
}
