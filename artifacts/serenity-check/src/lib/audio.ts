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

    // --- Sub-bass thump layer ---
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);

    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(90, ctx.currentTime);
    bassOsc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.18);

    bassGain.gain.setValueAtTime(0, ctx.currentTime);
    bassGain.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.012);
    bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    bassOsc.start(ctx.currentTime);
    bassOsc.stop(ctx.currentTime + 0.25);

    // --- Mid punch layer ---
    const midOsc = ctx.createOscillator();
    const midGain = ctx.createGain();
    midOsc.connect(midGain);
    midGain.connect(ctx.destination);

    midOsc.type = 'triangle';
    midOsc.frequency.setValueAtTime(220, ctx.currentTime);
    midOsc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);

    midGain.gain.setValueAtTime(0, ctx.currentTime);
    midGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.008);
    midGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

    midOsc.start(ctx.currentTime);
    midOsc.stop(ctx.currentTime + 0.16);

    // --- High "pop" click layer ---
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    clickOsc.connect(filter);
    filter.connect(clickGain);
    clickGain.connect(ctx.destination);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(880, ctx.currentTime);
    clickOsc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.07);

    clickGain.gain.setValueAtTime(0, ctx.currentTime);
    clickGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.006);
    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

    clickOsc.start(ctx.currentTime);
    clickOsc.stop(ctx.currentTime + 0.1);

  } catch {
    // Audio not supported
  }
}

export function triggerHaptic(type: 'select' | 'transition' | 'standard' = 'standard') {
  try {
    if (!('vibrate' in navigator)) return;
    if (type === 'select') {
      // Strong double thump
      navigator.vibrate([60, 30, 80]);
    } else if (type === 'transition') {
      // Triple pulse — premium confirm feel
      navigator.vibrate([40, 20, 40, 20, 60]);
    } else {
      navigator.vibrate(30);
    }
  } catch {
    // Haptics not supported
  }
}

export function playTransitionSound() {
  try {
    const ctx = getAudioCtx();

    // Bass thump
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);

    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(70, ctx.currentTime);
    bassOsc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.2);

    bassGain.gain.setValueAtTime(0, ctx.currentTime);
    bassGain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.01);
    bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    bassOsc.start(ctx.currentTime);
    bassOsc.stop(ctx.currentTime + 0.28);

    // Rising tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);

  } catch {
    // Audio not supported
  }
}
