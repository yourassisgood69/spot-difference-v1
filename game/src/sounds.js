// Generated sounds for Spot the Difference. Every sound is a short tone
// shaped in code with the browser's built-in audio; no sound file is loaded.

const SD_Sounds = {
  ctx: null,
  enabled: true,

  ensure() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  tone(freq, at, dur, type, vol) {
    if (!this.enabled) return;
    const ac = this.ensure();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    const t0 = ac.currentTime + at;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol || 0.16, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  },

  playClick() {
    this.tone(660, 0, 0.07, 'triangle', 0.08);
  },

  playFind(combo) {
    // A two-note chime that climbs a little as the combo grows.
    const lift = Math.min(combo || 1, 6) * 24;
    this.tone(740 + lift, 0, 0.16, 'sine', 0.18);
    this.tone(1108 + lift, 0.09, 0.24, 'sine', 0.18);
    this.tone(1480 + lift, 0.18, 0.2, 'triangle', 0.08);
  },

  playMiss() {
    this.tone(196, 0, 0.22, 'sawtooth', 0.07);
    this.tone(147, 0.05, 0.25, 'sawtooth', 0.06);
  },

  playHint() {
    this.tone(880, 0, 0.1, 'sine', 0.12);
    this.tone(1174, 0.08, 0.14, 'sine', 0.12);
  },

  playTick() {
    this.tone(1200, 0, 0.05, 'square', 0.04);
  },

  playWin() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((n, i) => this.tone(n, i * 0.11, 0.3, 'triangle', 0.14));
  },
};
