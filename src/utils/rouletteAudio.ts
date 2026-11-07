/**
 * Web Audio API synthesizer for the discount roulette wheel.
 * Self-contained, zero-latency, works across all browsers without external assets.
 */

let audioCtx: AudioContext | null = null;
let activeWheelNodes: { stop: () => void }[] = [];

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContextClass();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

/**
 * Single percussive roulette needle click / tick.
 */
function playClick(ctx: AudioContext, time: number, isSlowEnding = false) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Primary tick pitch bend (resembles plastic flapper snapping over roulette pin)
  const baseFreq = isSlowEnding ? 750 : 920;
  osc.type = isSlowEnding ? 'triangle' : 'sine';
  osc.frequency.setValueAtTime(baseFreq, time);
  osc.frequency.exponentialRampToValueAtTime(140, time + 0.035);

  const maxGain = isSlowEnding ? 0.45 : 0.28;
  gain.gain.setValueAtTime(maxGain, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + (isSlowEnding ? 0.05 : 0.03));

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.06);

  // Add a subtle high metallic snap for extra realism
  const snapOsc = ctx.createOscillator();
  const snapGain = ctx.createGain();
  snapOsc.type = 'triangle';
  snapOsc.frequency.setValueAtTime(2400, time);
  snapOsc.frequency.exponentialRampToValueAtTime(600, time + 0.015);

  snapGain.gain.setValueAtTime(isSlowEnding ? 0.2 : 0.12, time);
  snapGain.gain.exponentialRampToValueAtTime(0.001, time + 0.018);

  snapOsc.connect(snapGain);
  snapGain.connect(ctx.destination);

  snapOsc.start(time);
  snapOsc.stop(time + 0.025);
}

/**
 * Plays the realistic wheel spinning sound with progressive deceleration
 * perfectly synced to the 5.5s suspense wheel animation.
 */
export function playRouletteSpinSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Stop any previous spinning sound if active
  stopRouletteSounds();

  const now = ctx.currentTime + 0.02;

  // Timestamps for clicks (in seconds) matching the cubic-bezier(0.06, 0.88, 0.12, 1) curve
  // Rapid at start, gradually stretching out to maximum suspense before landing on 85%
  const tickTimes: number[] = [
    // Fast initial phase (0 - 1.2s)
    0.00, 0.04, 0.08, 0.12, 0.16, 0.20, 0.24, 0.28, 0.32, 0.37, 
    0.42, 0.47, 0.52, 0.58, 0.64, 0.70, 0.77, 0.84, 0.91, 0.99,
    1.07, 1.16, 1.25,
    // Moderate deceleration (1.3 - 3.0s)
    1.35, 1.46, 1.58, 1.70, 1.83, 1.97, 2.12, 2.28, 2.45, 2.63, 2.82, 3.02,
    // Suspense crawl phase (3.1 - 4.5s)
    3.24, 3.48, 3.74, 4.02, 4.32,
    // Final heart-stopping suspense clicks into 85% slice (4.6 - 5.3s)
    4.64, 4.98, 5.30
  ];

  tickTimes.forEach((t) => {
    const isFinalFour = t >= 4.0;
    playClick(ctx, now + t, isFinalFour);
  });
}

/**
 * Plays a triumphant, celebratory winner sound when landing on 85%.
 * Features a bright ascending fanfare, punchy sub-kick, and shimmering jackpot bells.
 */
export function playWinnerSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  stopRouletteSounds();

  const now = ctx.currentTime + 0.05;

  // 1. Confetti cannon sub-punch (deep punchy boom)
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(160, now);
  subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.25);
  subGain.gain.setValueAtTime(0.5, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  subOsc.connect(subGain);
  subGain.connect(ctx.destination);
  subOsc.start(now);
  subOsc.stop(now + 0.35);

  // 2. Ascending Brass Fanfare (C5 -> E5 -> G5 -> C6 -> E6 -> G6 -> High Victory Chord)
  const fanfareNotes = [
    { freq: 523.25, time: 0.00, dur: 0.16 }, // C5
    { freq: 659.25, time: 0.14, dur: 0.16 }, // E5
    { freq: 783.99, time: 0.28, dur: 0.18 }, // G5
    { freq: 1046.5, time: 0.44, dur: 0.22 }, // C6
    { freq: 1318.5, time: 0.62, dur: 0.26 }, // E6
    { freq: 1567.98, time: 0.82, dur: 0.85 }, // G6 sustained!
  ];

  fanfareNotes.forEach(({ freq, time, dur }) => {
    const noteStart = now + time;

    // Rich dual-oscillator brass tone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const noteGain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, noteStart);
    osc2.frequency.setValueAtTime(freq * 1.004, noteStart); // Subtle chorus detune

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, noteStart);
    filter.frequency.exponentialRampToValueAtTime(1400, noteStart + dur);

    noteGain.gain.setValueAtTime(0.24, noteStart);
    noteGain.gain.exponentialRampToValueAtTime(0.001, noteStart + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(ctx.destination);

    osc1.start(noteStart);
    osc2.start(noteStart);
    osc1.stop(noteStart + dur + 0.05);
    osc2.stop(noteStart + dur + 0.05);
  });

  // 3. Victory Chord Sustained (t + 0.85s)
  const chordFreqs = [523.25, 659.25, 783.99, 1046.5]; // C Major triumph
  chordFreqs.forEach((freq) => {
    const chordStart = now + 0.85;
    const dur = 1.6;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, chordStart);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2800, chordStart);
    filter.frequency.exponentialRampToValueAtTime(800, chordStart + dur);

    gain.gain.setValueAtTime(0.12, chordStart);
    gain.gain.exponentialRampToValueAtTime(0.001, chordStart + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(chordStart);
    osc.stop(chordStart + dur + 0.05);
  });

  // 4. Sparkling Casino Jackpot Bells (ringing celebrate chime sequence)
  const bellPitches = [
    { freq: 1318.51, delay: 0.95 },
    { freq: 1567.98, delay: 1.10 },
    { freq: 2093.00, delay: 1.25 },
    { freq: 2637.02, delay: 1.40 },
    { freq: 2093.00, delay: 1.55 },
    { freq: 2637.02, delay: 1.70 },
    { freq: 3135.96, delay: 1.85 },
  ];

  bellPitches.forEach(({ freq, delay }) => {
    const bellStart = now + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, bellStart);

    gain.gain.setValueAtTime(0.22, bellStart);
    gain.gain.exponentialRampToValueAtTime(0.001, bellStart + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(bellStart);
    osc.stop(bellStart + 0.4);
  });
}

export function stopRouletteSounds() {
  activeWheelNodes.forEach((node) => {
    try {
      node.stop();
    } catch {
      // Ignored
    }
  });
  activeWheelNodes = [];
}
