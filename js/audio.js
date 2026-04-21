// Three Little Wings — Audio manager
// Web Audio API wrapper. Falls back to procedural synth when audio files are missing.

import { CONFIG } from './config.js';
import { AudioSynth, synthSfx } from './audio-synth.js';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.voiceGain = null;

    this.currentBgm = null;   // { gain, source?, synth?, name }
    this.buffers = new Map(); // url -> AudioBuffer | null
    this.muted = false;
    this.unlocked = false;
  }

  /** Call after first user gesture (required by browser autoplay policy). */
  init() {
    if (this.ctx) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1.0;
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = CONFIG.BGM_VOLUME;
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = CONFIG.SFX_VOLUME;
      this.sfxGain.connect(this.masterGain);

      this.voiceGain = this.ctx.createGain();
      this.voiceGain.gain.value = CONFIG.VOICE_VOLUME;
      this.voiceGain.connect(this.masterGain);

      this.unlocked = true;
    } catch (e) {
      console.warn('[Audio] Web Audio not supported:', e);
    }
  }

  async _loadBuffer(url) {
    if (this.buffers.has(url)) return this.buffers.get(url);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const ab = await res.arrayBuffer();
      const buf = await this.ctx.decodeAudioData(ab);
      this.buffers.set(url, buf);
      return buf;
    } catch {
      this.buffers.set(url, null); // cache miss so we don't retry
      return null;
    }
  }

  /**
   * Play BGM. Crossfades from current track.
   * Falls back to procedural synth if the audio file doesn't exist.
   */
  async playBgm(url, { fadeMs = 1500 } = {}) {
    if (!this.ctx) return;
    if (this.currentBgm && this.currentBgm.name === url) return;

    const fadeSec = fadeMs / 1000;

    // Fade out and discard previous track
    if (this.currentBgm) {
      const old = this.currentBgm;
      const now = this.ctx.currentTime;
      old.gain.gain.cancelScheduledValues(now);
      old.gain.gain.setValueAtTime(old.gain.gain.value, now);
      old.gain.gain.linearRampToValueAtTime(0, now + fadeSec);
      setTimeout(() => {
        try { old.source?.stop(); } catch (_) {}
        try { old.synth?.destroy(); } catch (_) {}
        try { old.gain.disconnect(); } catch (_) {}
      }, fadeMs + 150);
    }
    this.currentBgm = null;
    if (!url) return;

    // Per-track gain node for independent fade control
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    gain.connect(this.bgmGain);
    const now = this.ctx.currentTime;
    gain.gain.linearRampToValueAtTime(1, now + fadeSec);

    const trackName = url.replace(/^audio\//, '').replace(/\.mp3$/, '');
    const buf = await this._loadBuffer(url);

    if (buf) {
      // Real audio file found
      const source = this.ctx.createBufferSource();
      source.buffer = buf;
      source.loop = true;
      source.connect(gain);
      source.start(0);
      this.currentBgm = { source, gain, synth: null, name: url };
    } else {
      // No file — generate music procedurally
      const synth = new AudioSynth(this.ctx, gain);
      synth.play(trackName);
      this.currentBgm = { source: null, gain, synth, name: url };
    }
  }

  /**
   * Play one-shot SFX. Falls back to procedural synth if file is missing.
   */
  async playSfx(url, { volume = 1.0 } = {}) {
    if (!this.ctx) return;
    const buf = await this._loadBuffer(url);
    if (buf) {
      const source = this.ctx.createBufferSource();
      source.buffer = buf;
      const gain = this.ctx.createGain();
      gain.gain.value = volume;
      source.connect(gain).connect(this.sfxGain);
      source.start(0);
    } else {
      const sfxName = url.replace(/^audio\//, '').replace(/\.mp3$/, '');
      synthSfx(this.ctx, this.sfxGain, sfxName);
    }
  }

  /** Create a synthetic reverb impulse response — large hall with echo/decay */
  _getReverbBuffer() {
    if (this._reverbBuf) return this._reverbBuf;
    const sr = this.ctx.sampleRate;
    const duration = 3.5;   // seconds of reverb tail
    const decay    = 2.8;   // higher = longer tail
    const len = Math.floor(sr * duration);
    const buf = this.ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        // Exponential decay noise — classic reverb IR
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    this._reverbBuf = buf;
    return buf;
  }

  async playVoice(url) {
    if (!this.ctx) return;
    const buf = await this._loadBuffer(url);
    if (!buf) return;

    // Dry path (direct signal)
    const source = this.ctx.createBufferSource();
    source.buffer = buf;
    const dryGain = this.ctx.createGain();
    dryGain.gain.value = 0.65;   // slightly subdued direct signal
    source.connect(dryGain).connect(this.voiceGain);

    // Wet path (reverb — ethereal, echoing in the mind)
    const convolver = this.ctx.createConvolver();
    convolver.buffer = this._getReverbBuffer();
    const wetGain = this.ctx.createGain();
    wetGain.gain.value = 0.50;   // prominent reverb tail
    source.connect(convolver).connect(wetGain).connect(this.voiceGain);

    source.start(0);
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.masterGain) this.masterGain.gain.value = muted ? 0 : 1;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
}

export const Audio = new AudioManager();
