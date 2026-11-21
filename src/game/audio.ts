import type { RadioStationId } from './types';

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private radioGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private volume = 0.8;

  private radioStation: RadioStationId = 'off';
  private radioIntervalId = 0;
  private radioStep = 0;

  private ensureContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (Ctx) {
        this.ctx = new Ctx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.ctx.destination);

        this.radioGain = this.ctx.createGain();
        this.radioGain.gain.value = 0.22;
        this.radioGain.connect(this.masterGain);

        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.value = 0;
        this.rainGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public unlock(): void {
    const ctx = this.ensureContext();
    if (ctx && this.radioStation !== 'off' && this.radioIntervalId === 0) {
      this.startRadioLoop();
    }
  }

  public setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.volume,
        this.ctx.currentTime,
        0.02,
      );
    }
  }

  public setRainAmbience(intensity: number): void {
    if (intensity <= 0.01 && !this.rainSource) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.rainGain) return;

    if (intensity > 0.01 && !this.rainSource) {
      const sampleCount = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      for (let i = 0; i < sampleCount; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + white * 0.029;
        b1 = 0.985 * b1 + white * 0.032;
        b2 = 0.95 * b2 + white * 0.048;
        data[i] = (b0 + b1 + b2 + white * 0.06) * 0.45;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1150;
      filter.Q.value = 0.6;

      src.connect(filter);
      filter.connect(this.rainGain);
      src.start();
      this.rainSource = src;
    }

    const target = Math.max(0, Math.min(1, intensity)) * 0.09;
    this.rainGain.gain.setTargetAtTime(target, ctx.currentTime, 0.25);
  }

  public setRadioStation(station: RadioStationId, playTuneClick = true): void {
    this.radioStation = station;
    if (this.radioIntervalId) {
      window.clearInterval(this.radioIntervalId);
      this.radioIntervalId = 0;
    }
    this.radioStep = 0;

    if (playTuneClick) {
      this.radioTune();
    }

    if (station !== 'off') {
      this.startRadioLoop();
    }
  }

  private startRadioLoop(): void {
    if (this.radioIntervalId || this.radioStation === 'off') return;
    const stepMs =
      this.radioStation === 'turku'
        ? 360
        : this.radioStation === 'fasil'
          ? 440
          : 520;
    this.radioIntervalId = window.setInterval(() => {
      this.playRadioStep();
    }, stepMs);
  }

  private playRadioStep(): void {
    if (this.radioStation === 'off' || this.volume <= 0.01) return;
    const ctx = this.ctx;
    if (!ctx || !this.radioGain || ctx.state !== 'running') return;

    const now = ctx.currentTime;

    // Gentle Turkish modal motifs (Hüseyni/Türkü, Hicaz Fasıl, Warm Nostalji)
    const turkuScale = [293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33]; // D Hüseyni feel
    const turkuPattern = [0, 2, 3, 4, 4, 3, 2, 1, 2, 3, 2, 1, 0, -1, 4, 2];

    const fasilScale = [293.66, 311.13, 369.99, 392.0, 440.0, 466.16, 523.25, 587.33]; // D Hicaz feel
    const fasilPattern = [0, 2, 4, 5, 4, 2, 1, 0, 2, 3, 2, 1, 0, -1, 0, 4];

    const nostaljiChords: Array<[number, number, number]> = [
      [220.0, 261.63, 329.63], // Am
      [196.0, 246.94, 293.66], // G
      [174.61, 220.0, 261.63], // F
      [164.81, 207.65, 246.94], // E
    ];

    if (this.radioStation === 'nostalji') {
      const beat = this.radioStep % 4;
      const chord = nostaljiChords[Math.floor(this.radioStep / 4) % nostaljiChords.length];
      if (beat === 0) {
        chord.forEach((freq) => {
          this.playRadioNote(freq, now, 0.95, 0.045, 'triangle', 1200);
        });
      } else {
        const arp = chord[beat % chord.length] * 2;
        this.playRadioNote(arp, now, 0.34, 0.032, 'sine', 1600);
      }
      this.radioStep++;
      return;
    }

    const scale = this.radioStation === 'turku' ? turkuScale : fasilScale;
    const pattern = this.radioStation === 'turku' ? turkuPattern : fasilPattern;
    const idx = pattern[this.radioStep % pattern.length];

    if (idx >= 0) {
      const freq = scale[idx];
      const wave: OscillatorType = this.radioStation === 'turku' ? 'triangle' : 'sine';
      const dur = this.radioStation === 'turku' ? 0.34 : 0.48;
      this.playRadioNote(freq, now, dur, 0.075, wave, 1800);
      // Soft drone / dem string every 4th beat
      if (this.radioStep % 4 === 0) {
        this.playRadioNote(146.83, now, 0.8, 0.04, 'triangle', 750);
      }
    }
    this.radioStep++;
  }

  private playRadioNote(
    freq: number,
    startTime: number,
    dur: number,
    vol: number,
    type: OscillatorType,
    cutoff: number,
  ): void {
    const ctx = this.ctx;
    if (!ctx || !this.radioGain) return;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.radioGain);
    osc.start(startTime);
    osc.stop(startTime + dur + 0.03);
  }

  public radioTune(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    // Mechanical switch click
    this.tone(420, 0.04, 'square', 0.07, 190);
    // Short vintage radio static hiss
    const len = Math.floor(ctx.sampleRate * 0.14);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2100;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.08, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.masterGain);
    src.start(now);
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType = 'sine',
    vol = 0.12,
    slideTo?: number,
    delay = 0,
  ): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  public pick(): void {
    this.tone(520, 0.07, 'triangle', 0.09, 680);
  }

  public coin(): void {
    this.tone(1180, 0.11, 'sine', 0.12);
    this.tone(1560, 0.16, 'sine', 0.12, undefined, 0.07);
  }

  public bell(): void {
    this.tone(980, 0.28, 'sine', 0.09);
    this.tone(1470, 0.34, 'sine', 0.06, undefined, 0.05);
  }

  public nope(): void {
    this.tone(240, 0.12, 'sawtooth', 0.07, 150);
  }

  public levelUp(): void {
    this.tone(523, 0.11, 'triangle', 0.11, undefined, 0);
    this.tone(659, 0.11, 'triangle', 0.11, undefined, 0.08);
    this.tone(784, 0.22, 'triangle', 0.12, undefined, 0.16);
  }

  public step(): void {
    this.tone(110 + Math.random() * 25, 0.045, 'triangle', 0.032, 70);
  }

  public sitDown(): void {
    this.tone(220, 0.12, 'triangle', 0.07, 140);
  }

  public drawerOpen(): void {
    this.tone(310, 0.09, 'square', 0.06, 480);
    this.tone(940, 0.18, 'triangle', 0.09, undefined, 0.06);
  }

  public bagRustle(): void {
    this.tone(360, 0.08, 'triangle', 0.06, 510);
    this.tone(480, 0.06, 'sine', 0.045, 300, 0.05);
  }

  public boxUnpack(): void {
    this.tone(260, 0.09, 'triangle', 0.08, 420);
    this.tone(420, 0.11, 'triangle', 0.08, 620, 0.07);
  }

  public restock(): void {
    this.tone(440, 0.08, 'triangle', 0.07, 560);
    this.tone(580, 0.1, 'triangle', 0.07, 740, 0.06);
  }

  public shutterClose(): void {
    this.tone(190, 0.22, 'sawtooth', 0.065, 95);
    this.tone(140, 0.26, 'triangle', 0.06, 80, 0.16);
  }

  public keyGrind(): void {
    this.tone(720, 0.18, 'sawtooth', 0.065, 960);
    this.tone(860, 0.16, 'triangle', 0.055, 680, 0.1);
  }

  public sawCut(): void {
    this.tone(310, 0.14, 'sawtooth', 0.075, 190);
    this.tone(540, 0.09, 'triangle', 0.06, 420, 0.08);
  }

  public dispose(): void {
    if (this.radioIntervalId) {
      window.clearInterval(this.radioIntervalId);
      this.radioIntervalId = 0;
    }
    if (this.rainSource) {
      try {
        this.rainSource.stop();
      } catch {
        // Ignore already stopped
      }
      this.rainSource.disconnect();
      this.rainSource = null;
    }
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
      this.masterGain = null;
      this.radioGain = null;
      this.rainGain = null;
    }
  }
}
