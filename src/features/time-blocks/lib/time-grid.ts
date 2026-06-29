export const PX_PER_MINUTE = 2;
export const HOUR_HEIGHT = 60 * PX_PER_MINUTE;
export const SNAP_MINUTES = 15;
export const MIN_BLOCK_MINUTES = 15;

export function snapMinutes(minutes: number, step = SNAP_MINUTES) {
  return Math.round(minutes / step) * step;
}

export function minutesToY(minutes: number) {
  return minutes * PX_PER_MINUTE;
}

export function yToMinutes(y: number) {
  return y / PX_PER_MINUTE;
}

export function clampMinutes(minutes: number) {
  return Math.min(Math.max(minutes, 0), 24 * 60);
}
