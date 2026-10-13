// src/lib/audio.js
// Procedural Web Audio API sound generator for gamification feedback

let audioCtx = null;
const SOUND_ENABLED_KEY = 'habit_buddy_sound_enabled';

export function isSoundEnabled() {
  const val = localStorage.getItem(SOUND_ENABLED_KEY);
  return val === null ? true : val === 'true';
}

export function setSoundEnabled(enabled) {
  localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
}

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a pleasant ascending positive chime on completing a habit
 */
export function playCheckSound() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Ascending melody
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16); // G5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);

    // Capacitor / Mobile Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  } catch (e) {
    console.debug('Audio playback skipped', e);
  }
}

/**
 * Plays a level-up or streak fanfare
 */
export function playLevelUpSound() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 40, 60]);
    }
  } catch (e) {
    console.debug('Fanfare audio skipped', e);
  }
}
