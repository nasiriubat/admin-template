// Pure token helpers (no 'use client'): safe to call from server components.

/** Design-token tones accepted by every landing primitive. Never pass raw colours. */
export type Tone =
  | 'canvas'
  | 'surface'
  | 'elevated'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted'
  | 'border';

/* Literal class names so Tailwind's scanner can see them. */
export const toneFill: Record<Tone, string> = {
  canvas: 'fill-canvas',
  surface: 'fill-surface',
  elevated: 'fill-surface-elevated',
  primary: 'fill-primary',
  secondary: 'fill-secondary',
  accent: 'fill-accent',
  success: 'fill-success',
  warning: 'fill-warning',
  danger: 'fill-danger',
  info: 'fill-info',
  muted: 'fill-text-muted',
  border: 'fill-border',
};

export const toneStroke: Record<Tone, string> = {
  canvas: 'stroke-canvas',
  surface: 'stroke-surface',
  elevated: 'stroke-surface-elevated',
  primary: 'stroke-primary',
  secondary: 'stroke-secondary',
  accent: 'stroke-accent',
  success: 'stroke-success',
  warning: 'stroke-warning',
  danger: 'stroke-danger',
  info: 'stroke-info',
  muted: 'stroke-text-muted',
  border: 'stroke-border',
};

export const toneBg: Record<Tone, string> = {
  canvas: 'bg-canvas',
  surface: 'bg-surface',
  elevated: 'bg-surface-elevated',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  muted: 'bg-text-muted',
  border: 'bg-border',
};

/** CSS variable holding the `r g b` triplet of each token, for gradients: `rgb(${toneRgb.primary} / 0.3)`. */
export const toneRgb: Record<Tone, string> = {
  canvas: 'var(--canvas-rgb)',
  surface: 'var(--surface-rgb)',
  elevated: 'var(--surface-elevated-rgb)',
  primary: 'var(--primary-rgb)',
  secondary: 'var(--secondary-rgb)',
  accent: 'var(--accent-rgb)',
  success: 'var(--success-rgb)',
  warning: 'var(--warning-rgb)',
  danger: 'var(--danger-rgb)',
  info: 'var(--info-rgb)',
  muted: 'var(--text-muted-rgb)',
  border: 'var(--border-rgb)',
};

/** `rgb(var(--x-rgb) / alpha)` for a tone. */
export const tokenColor = (tone: Tone, alpha = 1) => `rgb(${toneRgb[tone]} / ${alpha})`;

/** Deterministic PRNG (mulberry32) so SSR and client render identical decorative geometry. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
