// js/audio.js
window.StarAbyss = window.StarAbyss || {};

StarAbyss.SoundSynthManager = class {
    constructor() { this.ctx = null; }

    init() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) this.ctx = new AC();
        }
    }

    _tone(type, f0, f1, gain0, gain1, duration) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(f0, t);
        osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 0.001), t + duration);
        gain.gain.setValueAtTime(gain0, t);
        gain.gain.linearRampToValueAtTime(gain1, t + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + duration);
    }

    playShoot()     { this._tone('sawtooth', 500, 100, 0.12, 0.01, 0.08); }
    playExplosion() { this._tone('square',   120, 20,  0.30, 0.01, 0.30); }
    playClick()     { this._tone('sine',     800, 800, 0.05, 0.01, 0.04); }
    playAlarm()     { this._tone('triangle', 880, 440, 0.20, 0.01, 0.20); }
};

StarAbyss.audio = new StarAbyss.SoundSynthManager();