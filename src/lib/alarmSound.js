// Beep for the countdown alarm, generated with the Web Audio API (no audio
// files). Browsers keep an AudioContext suspended until a user gesture, so
// unlockAudio() must run from a click/keypress before beeps can be heard.

const MUTE_KEY = "evento-alarm-muted";

let context = null;
const listeners = new Set();

function getContext() {
  if (context) return context;
  const AudioContextClass = typeof window !== "undefined" ? window.AudioContext || window.webkitAudioContext : null;
  if (!AudioContextClass) return null;
  try {
    context = new AudioContextClass();
    context.onstatechange = () => listeners.forEach((fn) => fn(isAudioUnlocked()));
  } catch {
    context = null;
  }
  return context;
}

export function isAudioUnlocked() {
  return Boolean(context && context.state === "running");
}

export function subscribeAudioState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function unlockAudio() {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

export function playBeep({ frequency = 880, duration = 0.18, volume = 0.25 } = {}) {
  const ctx = getContext();
  if (!ctx || ctx.state !== "running") return false;
  const start = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
  return true;
}

export function loadMuted() {
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveMuted(muted) {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for the session only.
  }
}
