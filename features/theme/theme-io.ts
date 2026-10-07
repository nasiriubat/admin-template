import { contrastRatio, sanitizeThemeConfig, type ColorScale, type ThemeConfig } from '@nexus/theme';

export const AA_NORMAL = 4.5;
export const THEME_FILE_VERSION = 1;
export const MAX_THEME_FILE_BYTES = 64 * 1024;

export interface ContrastRow {
  id: string;
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  pass: boolean;
}

const PAIRS: Array<[id: string, label: string, fg: keyof ColorScale, bg: keyof ColorScale]> = [
  ['text-canvas', 'Text on canvas', 'text', 'canvas'],
  ['text-surface', 'Text on surface', 'text', 'surface'],
  ['text-elevated', 'Text on elevated surface', 'text', 'surfaceElevated'],
  ['muted-canvas', 'Muted text on canvas', 'textMuted', 'canvas'],
  ['muted-surface', 'Muted text on surface', 'textMuted', 'surface'],
  ['primary', 'Primary button text', 'primaryForeground', 'primary'],
  ['secondary', 'Secondary text', 'secondaryForeground', 'secondary'],
  ['accent', 'Accent text', 'accentForeground', 'accent'],
  ['success', 'Success text', 'successForeground', 'success'],
  ['warning', 'Warning text', 'warningForeground', 'warning'],
  ['danger', 'Danger text', 'dangerForeground', 'danger'],
  ['info', 'Info text', 'infoForeground', 'info'],
  ['primary-link', 'Primary as text on surface', 'primary', 'surface'],
  ['danger-link', 'Danger as text on surface', 'danger', 'surface'],
];

/** Computed WCAG 2.x contrast for every foreground/background pair a theme must keep readable. */
export function contrastRows(colors: ColorScale, threshold = AA_NORMAL): ContrastRow[] {
  return PAIRS.map(([id, label, fg, bg]) => {
    const ratio = contrastRatio(colors[fg], colors[bg]);
    return { id, label, foreground: colors[fg], background: colors[bg], ratio, pass: ratio >= threshold };
  });
}

export function buildThemeExport(config: ThemeConfig): string {
  return JSON.stringify({ version: THEME_FILE_VERSION, theme: config }, null, 2);
}

export type ThemeImportResult = { ok: true; config: Partial<ThemeConfig>; ignored: string[] } | { ok: false; error: string };

/**
 * Parse an imported theme file. Accepts `{ version, theme: {...} }` or a bare config object.
 * Unknown or invalid values are dropped (and reported) rather than applied.
 */
export function parseThemeImport(text: string, presetIds: readonly string[]): ThemeImportResult {
  if (text.length > MAX_THEME_FILE_BYTES) return { ok: false, error: 'This file is too large to be a theme export.' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'This file is not valid JSON.' };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { ok: false, error: 'Expected a JSON object with theme settings.' };
  const root = parsed as Record<string, unknown>;
  const source = root.theme && typeof root.theme === 'object' ? (root.theme as Record<string, unknown>) : root;
  const config = sanitizeThemeConfig(source, presetIds);
  if (Object.keys(config).length === 0) return { ok: false, error: 'No valid theme settings were found. Check the preset, mode, density, motion, radius and font values.' };
  const ignored = Object.keys(source).filter((key) => !(key in config));
  return { ok: true, config, ignored };
}
