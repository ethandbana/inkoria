class SoundManager {
  private audioContext: AudioContext | null = null;
  private customAudio: HTMLAudioElement | null = null;
  
  // Built-in sounds
  private builtInSounds = {
    ding: () => this.playBuiltInDing(),
    pop: () => this.playBuiltInPop(),
    chime: () => this.playBuiltInChime(),
    beep: () => this.playBuiltInBeep(),
    gentle: () => this.playGentleNotification()
  };
  
  // Play a built-in sound
  playBuiltIn(type: 'ding' | 'pop' | 'chime' | 'beep' | 'gentle') {
    const sound = this.builtInSounds[type];
    if (sound) sound();
  }
  
  // Play custom sound from file
  playCustomSound(file: File | string) {
    if (typeof file === 'string') {
      // URL or path
      const audio = new Audio(file);
      audio.volume = 0.4;
      audio.play().catch(e => console.log('Error playing sound:', e));
    } else {
      // File object
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.volume = 0.4;
      audio.play().catch(e => console.log('Error playing sound:', e));
      URL.revokeObjectURL(url);
    }
  }
  
  // Built-in: Gentle ding-dong
  private playBuiltInDing() {
    this.initAudioContext();
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const gain = this.audioContext.createGain();
    gain.connect(this.audioContext.destination);
    
    const osc1 = this.audioContext.createOscillator();
    osc1.frequency.value = 880;
    osc1.connect(gain);
    osc1.start(now);
    osc1.stop(now + 0.08);
    
    const osc2 = this.audioContext.createOscillator();
    osc2.frequency.value = 660;
    osc2.connect(gain);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.18);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.25);
  }
  
  // Built-in: Quick pop
  private playBuiltInPop() {
    this.initAudioContext();
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const gain = this.audioContext.createGain();
    gain.connect(this.audioContext.destination);
    
    const osc = this.audioContext.createOscillator();
    osc.frequency.value = 600;
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.05);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.08);
  }
  
  // Built-in: Soft chime
  private playBuiltInChime() {
    this.initAudioContext();
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const gain = this.audioContext.createGain();
    gain.connect(this.audioContext.destination);
    
    const notes = [523.25, 659.25, 783.99]; // C, E, G
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.5);
  }
  
  // Built-in: Beep
  private playBuiltInBeep() {
    this.initAudioContext();
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const gain = this.audioContext.createGain();
    gain.connect(this.audioContext.destination);
    
    const osc = this.audioContext.createOscillator();
    osc.frequency.value = 800;
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.1);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.12);
  }
  
  // Built-in: Gentle notification
  private playGentleNotification() {
    this.initAudioContext();
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const gain = this.audioContext.createGain();
    gain.connect(this.audioContext.destination);
    
    const osc = this.audioContext.createOscillator();
    osc.frequency.value = 523.25; // C
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.15);
    
    const osc2 = this.audioContext.createOscillator();
    osc2.frequency.value = 659.25; // E
    osc2.connect(gain);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.3);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);
  }
  
  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.audioContext.resume();
    }
  }
}

export const soundManager = new SoundManager();