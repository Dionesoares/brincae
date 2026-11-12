// Pure helpers for a child's chronometer. The running segment lives in
// started_at; time already banked while paused lives in elapsed_ms.
// Two children never share these fields, so their timers stay independent.

export function elapsedMilliseconds(child, now = Date.now()) {
  const base = Number(child?.elapsed_ms) || 0;
  if (!child?.started_at) return base;
  const started = new Date(child.started_at).getTime();
  if (Number.isNaN(started)) return base;
  return base + Math.max(0, now - started);
}

export function formatChronometer(ms) {
  const totalSeconds = Math.max(0, Math.floor(Number(ms) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
