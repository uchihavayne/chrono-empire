// Procedural audio engine — no asset files, works offline & inside the Capacitor webview.
// Web Audio synthesises a gentle looping background track per era plus short SFX.
// Music must be (re)started after a user gesture due to autoplay policies.

type Wave = OscillatorType;

// Per-era musical mood: root note (Hz), a scale (semitone offsets), tempo, timbre.
interface EraMusic {
  root: number;
  scale: number[];
  bpm: number;
  wave: Wave;
  padWave: Wave;
}

const SCALES: Record<string, number[]> = {
  minorPent: [0, 3, 5, 7, 10],
  majorPent: [0, 2, 4, 7, 9],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  hijaz: [0, 1, 4, 5, 7, 8, 11],     // Middle-Eastern / Ottoman flavour
  lydian: [0, 2, 4, 6, 7, 9, 11],    // bright / futuristic
  wholeTone: [0, 2, 4, 6, 8, 10],    // dreamy / cosmic
};

// Keyed by era id (from data.ts ERA_IDS).
const ERA_MUSIC: Record<string, EraMusic> = {
  paleo:       { root: 130.81, scale: SCALES.minorPent, bpm: 60, wave: 'triangle', padWave: 'sine' },
  meso:        { root: 138.59, scale: SCALES.minorPent, bpm: 64, wave: 'triangle', padWave: 'sine' },
  neo:         { root: 146.83, scale: SCALES.majorPent, bpm: 68, wave: 'triangle', padWave: 'sine' },
  copper:      { root: 155.56, scale: SCALES.dorian,    bpm: 72, wave: 'triangle', padWave: 'sine' },
  bronze:      { root: 164.81, scale: SCALES.dorian,    bpm: 76, wave: 'triangle', padWave: 'triangle' },
  iron:        { root: 174.61, scale: SCALES.minorPent, bpm: 80, wave: 'sawtooth', padWave: 'triangle' },
  turkic:      { root: 146.83, scale: SCALES.dorian,    bpm: 84, wave: 'sawtooth', padWave: 'triangle' },
  egypt:       { root: 138.59, scale: SCALES.hijaz,     bpm: 76, wave: 'triangle', padWave: 'sine' },
  rome:        { root: 164.81, scale: SCALES.dorian,    bpm: 80, wave: 'triangle', padWave: 'sine' },
  medieval:    { root: 146.83, scale: SCALES.dorian,    bpm: 72, wave: 'triangle', padWave: 'sine' },
  ottoman:     { root: 155.56, scale: SCALES.hijaz,     bpm: 88, wave: 'sawtooth', padWave: 'triangle' },
  renaissance: { root: 174.61, scale: SCALES.majorPent, bpm: 78, wave: 'triangle', padWave: 'sine' },
  industrial:  { root: 130.81, scale: SCALES.dorian,    bpm: 96, wave: 'square',   padWave: 'triangle' },
  modern:      { root: 196.00, scale: SCALES.majorPent, bpm: 104, wave: 'square',  padWave: 'sine' },
  space:       { root: 220.00, scale: SCALES.lydian,    bpm: 90, wave: 'triangle', padWave: 'sine' },
  future:      { root: 246.94, scale: SCALES.lydian,    bpm: 100, wave: 'sawtooth', padWave: 'triangle' },
  galactic:    { root: 261.63, scale: SCALES.wholeTone, bpm: 92, wave: 'triangle', padWave: 'sine' },
  cosmic:      { root: 293.66, scale: SCALES.wholeTone, bpm: 84, wave: 'sine',     padWave: 'triangle' },
};

function noteFreq(root: number, scale: number[], degree: number): number {
  const oct = Math.floor(degree / scale.length);
  const idx = ((degree % scale.length) + scale.length) % scale.length;
  return root * Math.pow(2, (scale[idx] + 12 * oct) / 12);
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private stepTimer: number | null = null;
  private curEra = '';
  private step = 0;
  private started = false;
  musicEnabled = true;
  // 0..1 user volume multipliers (persisted in game state). 1 = the original baseline levels.
  private musicVol = 1;
  private sfxVol = 1;

  private ensure(): boolean {
    if (this.ctx) return true;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.32;
      this.musicGain.connect(this.master);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.5 * this.sfxVol;
      this.sfxGain.connect(this.master);
      return true;
    } catch {
      return false;
    }
  }

  // ─── single looping background track (replaces the per-era procedural music) ───
  private bg: HTMLAudioElement | null = null;
  private startBg(): void {
    if (!this.musicEnabled) return;
    if (!this.bg) {
      this.bg = new Audio('/bg-music.mp3');
      this.bg.loop = true;
    }
    this.bg.volume = 0.5 * this.musicVol;
    this.bg.play().catch(() => { /* autoplay blocked until a gesture — retried on next unlock */ });
  }
  private stopBg(): void {
    if (this.bg) { try { this.bg.pause(); } catch { /* ignore */ } }
  }

  /** call from a user gesture: always create + resume the audio ctx (for SFX), and start the
   *  soundtrack if music is enabled. SFX and music are independent toggles. */
  unlock(era: string): void {
    this.curEra = era;
    this.ensure();          // ctx needed for SFX even when music is off
    this.ctx?.resume?.();
    this.started = true;
    this.startBg();         // no-op if music disabled
  }

  /** music on/off (independent of SFX) */
  setMusicEnabled(on: boolean): void {
    this.musicEnabled = on;
    if (!on) {
      this.stopMusic();
      this.stopBg();
    } else if (this.started) {
      this.ensure();
      this.ctx?.resume?.();
      this.startBg();
    }
  }

  private stopMusic(): void {
    if (this.stepTimer !== null) { clearInterval(this.stepTimer); this.stepTimer = null; }
  }

  /** music volume 0..1 — affects the looping soundtrack live. */
  setMusicVolume(v: number): void {
    this.musicVol = Math.max(0, Math.min(1, v));
    if (this.bg) this.bg.volume = 0.5 * this.musicVol;
  }

  /** SFX volume 0..1 — affects all sound effects live via the SFX bus gain. */
  setSfxVolume(v: number): void {
    this.sfxVol = Math.max(0, Math.min(1, v));
    if (this.sfxGain) this.sfxGain.gain.value = 0.5 * this.sfxVol;
  }

  /** era changed — the single soundtrack keeps playing; just track the current era. */
  playEra(era: string, _force = false): void {
    this.curEra = era;
  }

  private padOsc: OscillatorNode[] = [];
  private playPad(m: EraMusic): void {
    if (!this.ctx || !this.musicGain) return;
    this.padOsc.forEach((o) => { try { o.stop(); } catch { /* already stopped */ } });
    this.padOsc = [];
    const now = this.ctx.currentTime;
    [0, 2].forEach((deg, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = m.padWave;
      osc.frequency.value = noteFreq(m.root, m.scale, deg) / 2;
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.06, now + 2);
      osc.connect(g); g.connect(this.musicGain!);
      osc.start();
      this.padOsc.push(osc);
      void i;
    });
  }

  private tickMusic(m: EraMusic): void {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    // arpeggio pattern over the scale, with an occasional rest
    const pattern = [0, 2, 4, 2, 5, 4, 2, 0, 3, 5, 4, 2, 1, 3, 2, 0];
    const deg = pattern[this.step % pattern.length];
    this.step++;
    if (deg < 0) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = m.wave;
    osc.frequency.value = noteFreq(m.root, m.scale, deg + 7); // an octave up for the lead
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.12, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0008, now + 0.35);
    osc.connect(g); g.connect(this.musicGain);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // ─── SFX ───
  private blip(freq: number, dur: number, wave: Wave, vol = 0.4, slideTo?: number): void {
    // SFX are independent of the music toggle; the engine gates these calls by state.sfxOn.
    if (!this.ensure() || !this.ctx || !this.sfxGain) return;
    this.ctx.resume?.(); // in case the ctx is suspended (music off, no prior gesture)
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g); g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  private chord(freqs: number[], dur: number, wave: Wave, vol = 0.3): void {
    freqs.forEach((f) => this.blip(f, dur, wave, vol));
  }

  sfxBuy(): void { this.blip(660, 0.09, 'square', 0.35, 880); }
  sfxTap(): void { this.blip(520, 0.07, 'triangle', 0.3, 700); }
  sfxManager(): void { this.chord([523, 659, 784], 0.22, 'triangle', 0.28); }
  sfxUnlock(): void { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.blip(f, 0.28, 'triangle', 0.32), i * 90)); }
  sfxRebirth(): void { this.blip(200, 0.9, 'sawtooth', 0.35, 900); [392, 523, 659, 784].forEach((f, i) => setTimeout(() => this.blip(f, 0.4, 'sine', 0.3), 250 + i * 100)); }
  sfxAnomaly(): void { [880, 1175, 1568].forEach((f, i) => setTimeout(() => this.blip(f, 0.18, 'sine', 0.32), i * 60)); }
  sfxReward(): void { [659, 880, 1047].forEach((f, i) => setTimeout(() => this.blip(f, 0.2, 'triangle', 0.3), i * 70)); }
  sfxError(): void { this.blip(160, 0.15, 'square', 0.25, 110); }
}

export const audio = new AudioEngine();
