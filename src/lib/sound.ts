// Procedural Web Audio API sound generator for campfire ambience and gameplay feedback
class SoundEngine {
  private ctx: AudioContext | null = null;
  private campfireSource: AudioBufferSourceNode | null = null;
  private campfireGain: GainNode | null = null;
  private isCampfirePlaying = false;
  private enabled: boolean = true;
  private volume: number = 0.4;

  constructor() {
    const savedMute = localStorage.getItem('kith_sound_enabled');
    if (savedMute !== null) {
      this.enabled = savedMute === 'true';
    }
    const savedVol = localStorage.getItem('kith_sound_volume');
    if (savedVol !== null) {
      this.volume = parseFloat(savedVol);
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleSound(enabled?: boolean): boolean {
    this.enabled = enabled !== undefined ? enabled : !this.enabled;
    localStorage.setItem('kith_sound_enabled', String(this.enabled));
    if (!this.enabled && this.isCampfirePlaying) {
      this.stopCampfire();
    }
    return this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('kith_sound_volume', String(this.volume));
    if (this.campfireGain && this.ctx) {
      this.campfireGain.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  // Play a warm, uplifting harmonic chime on quest completion
  public playQuestComplete() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Play a peaceful C major pentatonic chord: C5, E5, G5, B5, C6
      const freqs = [523.25, 659.25, 783.99, 987.77, 1046.5];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(this.volume * 0.15, now + idx * 0.06 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 1.0);
      });
    } catch {
      // Audio autoplay restrictions or headless env
    }
  }

  // Play a radiant, resonant harp chime when kindling a companion
  public playKindleBuff() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 830.61, 1108.73]; // A major 7th chord
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.3);
      });
    } catch {
      // Ignore audio failure
    }
  }

  // Start peaceful ambient campfire crackling (procedural brown noise + spark pops)
  public startCampfire() {
    if (!this.enabled || this.isCampfirePlaying) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 3; // 3 seconds looped buffer
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        // Brown noise generation
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 2.5;

        // Add occasional crisp crackle pops
        if (Math.random() < 0.0008) {
          data[i] += (Math.random() * 2 - 1) * 0.8;
        }
      }

      this.campfireSource = this.ctx.createBufferSource();
      this.campfireSource.buffer = buffer;
      this.campfireSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      this.campfireGain = this.ctx.createGain();
      this.campfireGain.gain.setValueAtTime(this.volume * 0.12, this.ctx.currentTime);

      this.campfireSource.connect(filter);
      filter.connect(this.campfireGain);
      this.campfireGain.connect(this.ctx.destination);

      this.campfireSource.start();
      this.isCampfirePlaying = true;
    } catch {
      // audio suspended
    }
  }

  public stopCampfire() {
    if (this.campfireSource) {
      try {
        this.campfireSource.stop();
        this.campfireSource.disconnect();
      } catch {
        // already stopped
      }
      this.campfireSource = null;
    }
    this.isCampfirePlaying = false;
  }

  public toggleCampfireAmbience(): boolean {
    if (this.isCampfirePlaying) {
      this.stopCampfire();
      return false;
    } else {
      this.startCampfire();
      return this.isCampfirePlaying;
    }
  }

  public isCampfireActive(): boolean {
    return this.isCampfirePlaying;
  }
}

export const sound = new SoundEngine();
