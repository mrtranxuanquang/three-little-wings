// Three Little Wings — Procedural Audio Synthesizer
// Generates BGM and SFX using Web Audio API — no audio files required.

// Note frequency lookup (Hz)
const N = {
  D2:73.42, E2:82.41, F2:87.31, G2:98.00, A2:110.00, B2:123.47,
  C3:130.81, D3:146.83, Eb3:155.56, E3:164.81, F3:174.61,
  G3:196.00, Ab3:207.65, A3:220.00, Bb3:233.08, B3:246.94,
  C4:261.63, D4:293.66, Eb4:311.13, E4:329.63, F4:349.23,
  Gb4:369.99, G4:392.00, Ab4:415.30, A4:440.00, Bb4:466.16, B4:493.88,
  C5:523.25, D5:587.33, Eb5:622.25, E5:659.25, F5:698.46,
  Gb5:739.99, G5:783.99, Ab5:830.61, A5:880.00, B5:987.77,
  C6:1046.50, E6:1318.51, G6:1567.98,
  R: 0,
};

// =========================================================
// AudioSynth — one instance per active BGM session
// =========================================================
export class AudioSynth {
  constructor(ctx, out) {
    this.ctx = ctx;
    this.out = out;       // GainNode from audio.js (already connected to bgmGain)
    this._stopped = false;
    this._timer = null;
    this._nextTime = 0;
  }

  destroy() {
    this._stopped = true;
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
  }

  // Schedule one oscillator note with envelope
  _osc(freq, t0, t1, type = 'triangle', vol = 0.25) {
    if (!freq || freq === N.R) return;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const dur = t1 - t0;
    const a = Math.min(0.025, dur * 0.12);
    const r = Math.min(0.10,  dur * 0.35);
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(vol, t0 + a);
    env.gain.setValueAtTime(vol, t1 - r);
    env.gain.linearRampToValueAtTime(0, t1);
    osc.connect(env).connect(this.out);
    osc.start(t0);
    osc.stop(t1 + 0.05);
  }

  // Schedule a sequence: steps = [[freq, beats], ...]
  _seq(steps, startT, beatLen, type, vol) {
    let t = startT;
    for (const [freq, beats] of steps) {
      const dur = beats * beatLen;
      if (freq && freq !== N.R) this._osc(freq, t, t + dur * 0.88, type, vol);
      t += dur;
    }
  }

  // Lookahead scheduler — calls barFn(time) → returns bar duration
  _loop(barFn) {
    this._nextTime = this.ctx.currentTime + 0.05;
    const tick = () => {
      if (this._stopped) return;
      while (this._nextTime < this.ctx.currentTime + 0.45) {
        const dur = barFn(this._nextTime);
        this._nextTime += dur;
      }
      this._timer = setTimeout(tick, 80);
    };
    tick();
  }

  play(trackName) {
    const map = {
      bgm_ch1_forest:  () => this._loop(t => this._ch1(t)),
      bgm_ch2_stream:  () => this._loop(t => this._ch2(t)),
      bgm_ch3_flowers: () => this._loop(t => this._ch3(t)),
      bgm_ch4_rungsau: () => this._loop(t => this._ch4(t)),
      bgm_ch5_hangtoi: () => this._loop(t => this._ch5cave(t)),
      bgm_ch5_domdom:  () => this._loop(t => this._ch5firefly(t)),
      bgm_ch6_vachnui: () => this._loop(t => this._ch6(t)),
      bgm_ch8_venha:   () => this._loop(t => this._ch8(t)),
    };
    map[trackName]?.();
  }

  // ============================================================
  // CH1: Bìa Rừng — playful, C major, 120 BPM, 4-beat bar
  // ============================================================
  _ch1(t) {
    const B = 60 / 120;
    // Melody: C major pentatonic, flute-like
    this._seq([
      [N.E5, .5], [N.D5, .25], [N.C5, .25], [N.E5, .5], [N.G5, .5],
      [N.D5, .5], [N.C5, .5],  [N.A4,  .5], [N.G4,  .5],
    ], t, B, 'triangle', 0.20);
    // Bass: root movement
    this._seq([
      [N.C3, 1], [N.G3, 1], [N.F3, 1], [N.G3, 1],
    ], t, B, 'sine', 0.16);
    // Inner pad
    this._seq([
      [N.E4, 2], [N.D4, 2],
    ], t, B, 'sine', 0.07);
    return 4 * B;
  }

  // ============================================================
  // CH2: Suối Đá — flowing arpeggio, G major, 108 BPM, 8-beat bar
  // ============================================================
  _ch2(t) {
    const B = 60 / 108;
    // Flowing 16th-note arpeggio
    this._seq([
      [N.G4, .25], [N.B4, .25], [N.D5, .25], [N.G5, .25],
      [N.A4, .25], [N.C5, .25], [N.E5, .25], [N.A5, .25],
      [N.B4, .25], [N.D5, .25], [N.G5, .25], [N.B5, .25],
      [N.G4, .25], [N.D5, .25], [N.B4, .25], [N.G4, .25],
    ], t, B, 'triangle', 0.16);
    // Second half — variation
    this._seq([
      [N.A4, .25], [N.C5, .25], [N.E5, .25], [N.A5, .25],
      [N.G4, .25], [N.B4, .25], [N.D5, .25], [N.G5, .25],
      [N.D4, .25], [N.G4, .25], [N.B4, .25], [N.D5, .25],
      [N.G4,  .5], [N.D5,  .5], [N.G5,  1],
    ], t + 4 * B, B, 'triangle', 0.16);
    // Bass
    this._seq([
      [N.G3, 2], [N.A3, 2], [N.B3, 2], [N.G3, 2],
    ], t, B, 'sine', 0.14);
    return 8 * B;
  }

  // ============================================================
  // CH3: Rừng Hoa — dreamy waltz, C major, 88 BPM, 8-beat bar
  // ============================================================
  _ch3(t) {
    const B = 60 / 88;
    this._seq([
      [N.C5,  1], [N.E5, .5], [N.G5, .5],
      [N.A4,  1], [N.C5, .5], [N.E5, .5],
      [N.G4,  1], [N.B4, .5], [N.D5, .5],
      [N.C5,  2],
    ], t, B, 'triangle', 0.20);
    // Waltz bass: root + chord
    this._seq([
      [N.C3, .5], [N.G3, .5], [N.E3, .5], [N.G3, .5],
      [N.A2, .5], [N.E3, .5], [N.A2, .5], [N.E3, .5],
      [N.G2, .5], [N.D3, .5], [N.G2, .5], [N.D3, .5],
      [N.C3,  1], [N.G3,  1],
    ], t, B, 'sine', 0.14);
    // Soft pad shimmer
    this._seq([
      [N.E4, 4], [N.F4, 4],
    ], t, B, 'sine', 0.06);
    return 8 * B;
  }

  // ============================================================
  // CH4: Rừng Sâu — dark, D minor, 78 BPM, 8-beat bar
  // ============================================================
  _ch4(t) {
    const B = 60 / 78;
    // Sparse, ominous melody
    this._seq([
      [N.D4, 1.5], [N.R,  .5], [N.F4,  1], [N.Eb4, 1],
      [N.D4,   2], [N.R,   2],
    ], t, B, 'sawtooth', 0.10);
    // Low drone (held for the whole bar)
    this._osc(N.D3, t, t + 8 * B, 'sine', 0.16);
    this._osc(N.A2, t, t + 8 * B, 'sine', 0.10);
    // Pulse hits on every 2 beats
    for (let i = 0; i < 4; i++) {
      this._osc(N.D2, t + i * 2 * B, t + i * 2 * B + 0.07, 'sine', 0.22);
    }
    return 8 * B;
  }

  // ============================================================
  // CH5cave: Hang Tối — dark drone, A minor, 55 BPM, 8-beat bar
  // ============================================================
  _ch5cave(t) {
    const B = 60 / 55;
    // Held drone layered across octaves
    this._osc(N.A2, t, t + 8 * B, 'sine', 0.14);
    this._osc(N.E3, t, t + 8 * B, 'sine', 0.08);
    this._osc(N.A3, t, t + 8 * B, 'sine', 0.05);
    // Occasional eerie high notes
    this._osc(N.C5,  t + 2.0 * B, t + 2.0 * B + 1.0, 'sine', 0.05);
    this._osc(N.G4,  t + 5.5 * B, t + 5.5 * B + 0.9, 'sine', 0.04);
    this._osc(N.Eb4, t + 7.2 * B, t + 7.2 * B + 0.6, 'sine', 0.04);
    return 8 * B;
  }

  // ============================================================
  // CH5firefly: Đom Đóm — magical sparkle, E major, 100 BPM, 8-beat bar
  // ============================================================
  _ch5firefly(t) {
    const B = 60 / 100;
    // Main sparkly melody
    this._seq([
      [N.E5,  .5], [N.B5,  .5], [N.Ab5, .5], [N.E5,  .5],
      [N.B4,  .5], [N.E5,  .5], [N.Ab5,  1],
      [N.Ab5, .5], [N.B5,  .5], [N.E6,  .5], [N.R,   .5],
      [N.E5,  .5], [N.Ab5, .5], [N.B5,   1],
    ], t, B, 'sine', 0.15);
    // Bass
    this._seq([
      [N.E3, 2], [N.B3, 2], [N.Ab3, 2], [N.E3, 2],
    ], t, B, 'triangle', 0.12);
    // Sparkle pings — brief high-pitched blips
    [0.4, 1.8, 2.6, 4.1, 5.3, 6.8].forEach(beat => {
      const f = [N.E5, N.Ab5, N.B5, N.E6][Math.floor(beat * 1.5) % 4];
      this._osc(f, t + beat * B, t + beat * B + 0.055, 'sine', 0.12);
    });
    return 8 * B;
  }

  // ============================================================
  // CH6: Vách Núi — determined ascending, C major, 116 BPM, 8-beat bar
  // ============================================================
  _ch6(t) {
    const B = 60 / 116;
    // Ascending melodic line
    this._seq([
      [N.G4, .5], [N.A4, .5], [N.C5, .5], [N.E5,  .5],
      [N.D5, .5], [N.C5, .5], [N.A4,  1],
      [N.C5, .5], [N.D5, .5], [N.E5, .5], [N.G5,  .5],
      [N.E5, .5], [N.D5, .5], [N.C5,  1],
    ], t, B, 'triangle', 0.22);
    // Rhythmic 8th-note bass
    this._seq([
      [N.C3, .5], [N.G3, .5], [N.C3, .5], [N.G3, .5],
      [N.F3, .5], [N.C3, .5], [N.F3, .5], [N.C3, .5],
      [N.G3, .5], [N.D3, .5], [N.G3, .5], [N.D3, .5],
      [N.C3, .5], [N.G3, .5], [N.C3,  1],
    ], t, B, 'sine', 0.18);
    return 8 * B;
  }

  // ============================================================
  // CH8: Về Nhà — warm, triumphant, G major, 92 BPM, 16-beat bar
  // ============================================================
  _ch8(t) {
    const B = 60 / 92;
    // Full warm melody
    this._seq([
      [N.G4, 1], [N.A4, .5], [N.B4, .5], [N.D5,  1], [N.G5, 1],
      [N.E5, 1], [N.D5,  1], [N.B4,  2],
      [N.D5, 1], [N.E5, .5], [N.D5, .5], [N.B4,  1], [N.G4, 1],
      [N.A4, 1], [N.G4,  1], [N.G4,  2],
    ], t, B, 'triangle', 0.22);
    // Warm pad chords
    this._seq([
      [N.G3, 2], [N.D4, 2],
      [N.E3, 2], [N.B3, 2],
      [N.D3, 2], [N.A3, 2],
      [N.G3, 2], [N.G3, 2],
    ], t, B, 'sine', 0.10);
    // Deep bass
    this._seq([
      [N.G2,  4], [N.E2,  4],
      [N.D2,  4], [N.G2,  4],
    ], t, B, 'sine', 0.18);
    return 16 * B;
  }
}

// =========================================================
// Procedural SFX (standalone, one-shot)
// =========================================================
export function synthSfx(ctx, out, name) {
  switch (name) {
    case 'sfx_rock_land':     _sfxRockLand(ctx, out);  break;
    case 'sfx_pickup':        _sfxPickup(ctx, out);     break;
    case 'sfx_switch':        _sfxSwitch(ctx, out);     break;
    case 'sfx_birds_morning': _sfxBirds(ctx, out);      break;
  }
}

function _sfxRockLand(ctx, out) {
  const t = ctx.currentTime;
  // Filtered noise burst
  const sr = ctx.sampleRate;
  const buf = ctx.createBuffer(1, Math.floor(sr * 0.35), sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / 1500);
  const ns = ctx.createBufferSource();
  ns.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass'; filt.frequency.value = 110;
  const gn = ctx.createGain();
  gn.gain.setValueAtTime(0.5, t);
  gn.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  ns.connect(filt).connect(gn).connect(out);
  ns.start(t); ns.stop(t + 0.38);
  // Sub-bass pitch sweep
  const osc = ctx.createOscillator();
  const go = ctx.createGain();
  osc.frequency.setValueAtTime(90, t);
  osc.frequency.exponentialRampToValueAtTime(25, t + 0.22);
  go.gain.setValueAtTime(0.35, t);
  go.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc.connect(go).connect(out);
  osc.start(t); osc.stop(t + 0.28);
}

function _sfxPickup(ctx, out) {
  const t = ctx.currentTime;
  // Ascending chime arpeggio
  [[N.C5, 0], [N.E5, 0.055], [N.G5, 0.11], [N.C6, 0.165]].forEach(([f, d]) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    const s = t + d;
    g.gain.setValueAtTime(0, s);
    g.gain.linearRampToValueAtTime(0.22, s + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, s + 0.22);
    o.connect(g).connect(out);
    o.start(s); o.stop(s + 0.25);
  });
}

function _sfxSwitch(ctx, out) {
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(380, t);
  o.frequency.linearRampToValueAtTime(580, t + 0.08);
  g.gain.setValueAtTime(0.18, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
  o.connect(g).connect(out);
  o.start(t); o.stop(t + 0.15);
}

function _sfxBirds(ctx, out) {
  const t = ctx.currentTime;
  const chirp = (st, freq, rate) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, st);
    o.frequency.linearRampToValueAtTime(freq * rate, st + 0.065);
    g.gain.setValueAtTime(0, st);
    g.gain.linearRampToValueAtTime(0.13, st + 0.008);
    g.gain.linearRampToValueAtTime(0.001, st + 0.09);
    o.connect(g).connect(out);
    o.start(st); o.stop(st + 0.1);
  };
  [
    [t,      2200, 1.15], [t + 0.12, 2200, 0.90],
    [t + 0.28, 1800, 1.20], [t + 0.42, 1800, 0.88],
    [t + 0.60, 2600, 1.10], [t + 0.72, 2600, 0.95],
    [t + 0.90, 2000, 1.18], [t + 1.05, 2000, 0.92],
    [t + 1.25, 1600, 1.25], [t + 1.45, 1600, 0.85],
    [t + 1.65, 2400, 1.12], [t + 1.80, 2400, 0.93],
  ].forEach(([s, f, r]) => chirp(s, f, r));
}
