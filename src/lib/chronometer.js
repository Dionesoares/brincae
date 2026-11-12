// Pure helpers for a child's chronometer. The running segment lives in
// started_at; time already banked while paused lives in elapsed_ms.
// Two children never share these fields, so their timers stay independent.
//
// Countdown mode (mode === "down") adds duration_ms (the starting duration)
// and added_ms (extra time). Remaining = duration_ms + added_ms - elapsed.

export const ONE_MINUTE_MS = 60 * 1000;
export const ALARM_THRESHOLD_MS = ONE_MINUTE_MS;

export function elapsedMilliseconds(child, now = Date.now()) {
  const base = Number(child?.elapsed_ms) || 0;
  if (!child?.started_at) return base;
  const started = new Date(child.started_at).getTime();
  if (Number.isNaN(started)) return base;
  return base + Math.max(0, now - started);
}

export function isCountdown(child) {
  return child?.mode === "down";
}

export function countdownTotalMilliseconds(child) {
  return (Number(child?.duration_ms) || 0) + (Number(child?.added_ms) || 0);
}

// Positive while time is left, zero at the end and negative once in overtime.
export function remainingMilliseconds(child, now = Date.now()) {
  return countdownTotalMilliseconds(child) - elapsedMilliseconds(child, now);
}

// True only while a running countdown has one minute or less left and has not
// reached zero yet. Pausing, resetting, hitting zero or adding time back above
// one minute all make it false.
export function isAlarmActive(child, now = Date.now()) {
  if (!isCountdown(child) || !child?.started_at) return false;
  const remaining = remainingMilliseconds(child, now);
  return remaining > 0 && remaining <= ALARM_THRESHOLD_MS;
}

export function formatChronometer(ms) {
  const totalSeconds = Math.max(0, Math.floor(Number(ms) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// What the card shows for a child: the label, whether a countdown has hit
// zero and the overtime that follows it. Remaining time is rounded up so the
// display only reads 00:00:00 once the countdown has really finished.
export function chronometerDisplay(child, now = Date.now()) {
  if (!isCountdown(child)) {
    return { label: formatChronometer(elapsedMilliseconds(child, now)), finished: false, overtime: false };
  }
  const remaining = remainingMilliseconds(child, now);
  if (remaining > 0) {
    return { label: formatChronometer(Math.ceil(remaining / 1000) * 1000), finished: false, overtime: false };
  }
  const overtime = Math.floor(-remaining / 1000) > 0;
  return {
    label: overtime ? `+${formatChronometer(-remaining)}` : formatChronometer(0),
    finished: true,
    overtime,
  };
}

// Patch that adds `ms` of extra time to a single child's timer. In countdown
// mode it raises the remaining time; in count-up mode it adds to the elapsed
// time (kept in elapsed_ms, so a running segment keeps ticking from started_at).
export function addTimePatch(child, ms) {
  const extra = Math.max(0, Math.round(Number(ms) || 0));
  if (isCountdown(child)) {
    return { added_ms: (Number(child?.added_ms) || 0) + extra };
  }
  return { elapsed_ms: (Number(child?.elapsed_ms) || 0) + extra };
}

// Converts the minutes/seconds typed by the admin into milliseconds.
export function durationFromParts(minutes, seconds) {
  const m = Math.max(0, Math.floor(Number(minutes) || 0));
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  return (m * 60 + s) * 1000;
}

export function splitDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
  return { minutes: Math.floor(totalSeconds / 60), seconds: totalSeconds % 60 };
}
