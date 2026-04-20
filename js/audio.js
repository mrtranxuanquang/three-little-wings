// Three Little Wings — Audio manager
// Web Audio API wrapper. All audio is OPTIONAL: files may not exist in Phase 1,
// engine runs silently if that's the case.

import { CONFIG } from './config.js';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.voiceGain = null;

    this.currentBgm = null;      // { source, gain, buffer, name }
    this.buffers = new Map();    // url -> AudioBuffer
    this.muted = false;
    this.unlocked = false;
  }

  /** Call after first user gesture (required by browser policies). */
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
    } catch (e) {
      // Silently fail — audio is optional
      this.buffers.set(url, null);
      return null;
    }
  }

  /**
   * Play BGM with crossfade. Returns immediately.
   * url: path to audio file. Pass null to stop current BGM.
   */
  async playBgm(url, { fadeMs = 1500, loop = true } = {}) {
    if (!this.ctx) return;
    // Same BGM already playing? no-op
    if (this.currentBgm && this.currentBgm.name === url) return;

    // Fade out previous
    if (this.currentBgm) {
      const old = this.currentBgm;
      const now = this.ctx.currentTime;
      old.gain.gain.cancelScheduledValues(now);
      old.gain.gain.setValueAtTime(old.gain.gain.value, now);
      old.gain.gain.linearRampToValueAtTime(0, now + fadeMs/1000);
      setTimeout(() => { try { old.source.stop(); } catch(e){} }, fadeMs + 100);
    }
    this.currentBgm = null;
    if (!url) return;

    const buf = await this._loadBuffer(url);
    if (!buf || !this.ctx) return; // audio missing — silent

    const source = this.ctx.createBufferSource();
    source.buffer = buf;
    source.loop = loop;
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain).connect(this.bgmGain);
    source.start(0);
    const now = this.ctx.currentTime;
    gain.gain.linearRampToValueAtTime(1, now + fadeMs/1000);
    this.currentBgm = { source, gain, buffer: buf, name: url };
  }

  async playSfx(url, { volume = 1.0 } = {}) {
    if (!this.ctx) return;
    const buf = await this._loadBuffer(url);
    if (!buf) return;
    const source = this.ctx.createBufferSource();
    source.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(this.sfxGain);
    source.start(0);
  }

  async playVoice(url) {
    if (!this.ctx) return;
    const buf = await this._loadBuffer(url);
    if (!buf) return;
    const source = this.ctx.createBufferSource();
    source.buffer = buf;
    source.connect(this.voiceGain);
    source.start(0);
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 1;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
}

export const Audio = new AudioManager();
