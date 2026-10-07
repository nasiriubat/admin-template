/**
 * Core color design tokens for Nexus Admin.
 * Strictly adheres to docs/DESIGN_SYSTEM.md and CLAUDE.md surface rules.
 */

export interface ColorScale {
  canvas: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  danger: string;
  dangerForeground: string;
  info: string;
  infoForeground: string;
}

export interface ThemeColors {
  light: ColorScale;
  dark: ColorScale;
}

/**
 * Helper to convert HEX to HSL or RGB if needed
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleaned = hex.replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function hexToRgbChannels(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

/** WCAG 2.x relative luminance of a hex colour. */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.x contrast ratio between two hex colours (1 to 21). */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

/** Linear mix of two hex colours; `weight` is the share of `towards` (0 to 1). */
export function mixHex(base: string, towards: string, weight: number): string {
  const a = hexToRgb(base);
  const b = hexToRgb(towards);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * weight);
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(mix(a.r, b.r))}${toHex(mix(a.g, b.g))}${toHex(mix(a.b, b.b))}`;
}
