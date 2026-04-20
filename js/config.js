// Three Little Wings — Configuration & Constants

export const CONFIG = {
  // Logical resolution — all game math uses these
  LOGICAL_WIDTH: 1920,
  LOGICAL_HEIGHT: 1080,

  // Ground baseline (y-coordinate where character feet stand)
  GROUND_Y: 920,

  // Physics tuning (per second)
  GRAVITY: 2400,
  JUMP_VELOCITY: -900,
  DOUBLE_JUMP_VELOCITY: -780,
  WALK_SPEED: 280,
  RUN_SPEED: 480,

  // Feel tuning
  COYOTE_TIME: 0.10,    // seconds after leaving ground you can still jump
  JUMP_BUFFER: 0.12,    // seconds input lingers
  FOLLOW_DISTANCE: 110, // follower idle distance behind leader
  FOLLOW_SPEED_BOOST: 1.15, // follower catches up 15% faster

  // Characters
  CHARACTER_IDS: ['choe', 'cucu', 'chien'],
  CHARACTER_NAMES: {
    choe:  'Chích Chòe',
    cucu:  'Cúc Cu',
    chien: 'Chiền Chiện',
    bo:    'Bố Quang',
  },
  CHARACTER_COLORS: {
    choe:  '#6b8e4e', // grey-green (his shirt)
    cucu:  '#6b9fd1', // soft sky blue (his shirt)
    chien: '#c94a42', // deep red (his sweater)
    bo:    '#7a8a9f',
  },

  // Character heights in game world (approximate, for proportions)
  CHARACTER_HEIGHTS: {
    choe:  320, // tallest (11yo, 1:6 ratio)
    cucu:  275, // middle (8yo, 1:5)
    chien: 230, // smallest (6yo, 1:4)
    bo:    380,
  },

  // Audio
  BGM_VOLUME: 0.55,
  SFX_VOLUME: 0.75,
  VOICE_VOLUME: 1.0,

  // Dialog
  TYPEWRITER_CHARS_PER_SECOND: 38,
  DIALOG_MIN_DISPLAY: 1200, // ms minimum before can advance

  // Cutscene
  KEN_BURNS_DEFAULT_DURATION: 8000,

  // Save slot
  SAVE_KEY: 'tlw_save_v1',
  SETTINGS_KEY: 'tlw_settings_v1',

  // Debug
  DEBUG: false, // toggle with `~` key
};

// Viewport/camera parameters
export const CAMERA = {
  LERP: 0.13,          // camera smoothly chases target (0.10 → 0.13: snappier without jarring)
  DEADZONE_X: 200,     // px the leader can move before camera follows
  LOOK_AHEAD: 120,     // camera biases slightly toward movement direction
};
