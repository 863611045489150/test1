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

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(880, ctx.currentTime);
    filter.Q.setValueAtTime(2.5, ctx.currentTime);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.008);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.14);
  } catch {
    // Audio not supported
  }
}

export function triggerHaptic(type: 'select' | 'transition' | 'standard' = 'standard') {
  try {
    if (!('vibrate' in navigator)) return;
    if (type === 'select') {
      navigator.vibrate([20, 10, 20]);
    } else if (type === 'transition') {
      navigator.vibrate([15, 8, 15, 8, 10]);
    } else {
      navigator.vibrate(10);
    }
  } catch {
    // Haptics not supported
  }
}

export function playTransitionSound() {
  try {
    const ctx = getAudioCtx();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(660, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(440, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.16);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.16);
  } catch {
    // Audio not supported
  }
}
