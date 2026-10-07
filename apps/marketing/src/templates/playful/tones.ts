/** Literal class maps (so Tailwind can see them) for the playful palette. Every value is a design token. */
export type PlayTone = 'primary' | 'accent' | 'warning' | 'danger' | 'success' | 'info';

/** Solid fill with its guaranteed-contrast foreground token. */
export const solid: Record<PlayTone, string> = {
  primary: 'bg-primary text-primary-foreground',
  accent: 'bg-accent text-accent-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-danger text-danger-foreground',
  success: 'bg-success text-success-foreground',
  info: 'bg-info text-info-foreground',
};

/** Ring colour used for card outlines. */
export const ring: Record<PlayTone, string> = {
  primary: 'border-primary',
  accent: 'border-accent',
  warning: 'border-warning',
  danger: 'border-danger',
  success: 'border-success',
  info: 'border-info',
};

export const isPlayTone = (t: string): t is PlayTone => t in solid;
export const toneOf = (t: string): PlayTone => (isPlayTone(t) ? t : 'primary');
