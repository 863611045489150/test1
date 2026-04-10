let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function playClickSound() {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.85, t);
    master.connect(ctx.destination);

    // Soft sub body — felt, not heard
    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.connect(bodyGain);
    bodyGain.connect(master);
    body.type = 'sine';
    body.frequency.setValueAtTime(160, t);
    body.frequency.exponentialRampToValueAtTime(60, t + 0.08);
    bodyGain.gain.setValueAtTime(0, t);
    bodyGain.gain.linearRampToValueAtTime(0.55, t + 0.006);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    body.start(t);
    body.stop(t + 0.12);

    // Crisp click transient — the satisfying "tap"
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    const clickFilter = ctx.createBiquadFilter();
    click.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(master);
    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime(2400, t);
    clickFilter.Q.setValueAtTime(0.8, t);
    click.type = 'sine';
    click.frequency.setValueAtTime(1200, t);
    click.frequency.exponentialRampToValueAtTime(600, t + 0.04);
    clickGain.gain.setValueAtTime(0, t);
    clickGain.gain.linearRampToValueAtTime(0.45, t + 0.003);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    click.start(t);
    click.stop(t + 0.07);

  } catch {
    // Audio not supported
  }
}

export function triggerHaptic(type: 'select' | 'transition' | 'standard' = 'standard') {
  try {
    if (!('vibrate' in navigator)) return;
    if (type === 'select') {
      navigator.vibrate([40, 15, 55]);
    } else if (type === 'transition') {
      navigator.vibrate([25, 15, 30, 15, 45]);
    } else {
      navigator.vibrate(20);
    }
  } catch {
    // Haptics not supported
  }
}

export function playTransitionSound() {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.3, t);
    master.connect(ctx.destination);

    // Warm low note
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.connect(bassGain);
    bassGain.connect(master);
    bass.type = 'sine';
    bass.frequency.setValueAtTime(110, t);
    bass.frequency.exponentialRampToValueAtTime(55, t + 0.16);
    bassGain.gain.setValueAtTime(0, t);
    bassGain.gain.linearRampToValueAtTime(0.6, t + 0.008);
    bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    bass.start(t);
    bass.stop(t + 0.22);

    // Gentle rising chime
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    const chimeFilter = ctx.createBiquadFilter();
    chime.connect(chimeFilter);
    chimeFilter.connect(chimeGain);
    chimeGain.connect(master);
    chimeFilter.type = 'highpass';
    chimeFilter.frequency.setValueAtTime(800, t);
    chime.type = 'sine';
    chime.frequency.setValueAtTime(660, t);
    chime.frequency.exponentialRampToValueAtTime(880, t + 0.12);
    chimeGain.gain.setValueAtTime(0, t);
    chimeGain.gain.linearRampToValueAtTime(0.28, t + 0.01);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    chime.start(t);
    chime.stop(t + 0.22);

  } catch {
    // Audio not supported
  }
}
