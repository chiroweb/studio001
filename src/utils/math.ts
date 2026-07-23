export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

export const normalizeAngle = (angle: number) =>
  Math.atan2(Math.sin(angle), Math.cos(angle));
