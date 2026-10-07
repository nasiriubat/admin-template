/**
 * Radius design tokens per docs/DESIGN_SYSTEM.md and docs/THEMING.md:
 * radius.sm, radius.md, radius.lg, radius.xl
 * Shape presets: small, medium, large, pill
 */

export type ShapePreset = 'small' | 'medium' | 'large' | 'pill';

export interface RadiusValues {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
  card: string;
  button: string;
  input: string;
}

export const radiusPresets: Record<ShapePreset, RadiusValues> = {
  small: {
    sm: '0.125rem', // 2px
    md: '0.25rem',  // 4px
    lg: '0.375rem', // 6px
    xl: '0.5rem',   // 8px
    full: '9999px',
    card: '0.375rem',
    button: '0.25rem',
    input: '0.25rem',
  },
  medium: {
    sm: '0.25rem',  // 4px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    full: '9999px',
    card: '0.75rem',
    button: '0.5rem',
    input: '0.5rem',
  },
  large: {
    sm: '0.375rem', // 6px
    md: '0.75rem',  // 12px
    lg: '1rem',     // 16px
    xl: '1.25rem',  // 20px
    full: '9999px',
    card: '1rem',
    button: '0.75rem',
    input: '0.75rem',
  },
  pill: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    full: '9999px',
    card: '1.25rem',
    button: '9999px',
    input: '9999px',
  },
};
