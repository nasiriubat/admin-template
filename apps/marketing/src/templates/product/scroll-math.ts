/** Pure scroll-progress maths for the Product template. Kept free of React so it is unit-testable. */
export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Smoothstep easing, 0 at t<=0 and 1 at t>=1. */
export const ease = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
/** Progress of `p` through the [start, end] window, clamped to 0..1. */
export const windowProgress = (p: number, start: number, end: number) => (end === start ? (p >= end ? 1 : 0) : clamp01((p - start) / (end - start)));

/** Hero device: tilted and slightly small at first, flat and full size once it has risen into view. */
export function heroFrame(p: number) {
  const t = ease(p);
  return { rotateX: lerp(16, 0, t), scale: lerp(0.88, 1, t), y: lerp(40, 0, t) };
}

export const ZOOM_PEAK = 2.4;

/** Zoom story: hold, zoom into a module, hold, zoom back out, hold. */
export function zoomScale(p: number) {
  const inT = ease(windowProgress(p, 0.15, 0.4));
  const outT = ease(windowProgress(p, 0.62, 0.87));
  return lerp(1, ZOOM_PEAK, inT) - (ZOOM_PEAK - 1) * outT;
}

/** Opacity of an item that is visible between `from` and `to` (with a short fade at each edge). */
export function visibleBetween(p: number, from: number, to: number, fade = 0.06) {
  return clamp01(Math.min((p - from) / fade, (to - p) / fade));
}

/** Which of the three zoom captions is current for a progress value. */
export function zoomCaptionIndex(p: number): 0 | 1 | 2 {
  if (p < 0.2) return 0;
  if (p < 0.6) return 1;
  return 2;
}
