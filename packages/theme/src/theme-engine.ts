import { hexToRgbChannels, type ColorScale } from './tokens/colors';
import { radiusPresets, type ShapePreset } from './tokens/radius';
import { fontFamilies, type FontFamily } from './tokens/typography';
import { densityConfigs, type DensityMode } from './tokens/density';
import { motionMultiplier, type MotionIntensity } from './tokens/motion';
import type { ThemePreset } from './presets';

export const COLOR_MODES = ['light', 'dark', 'system'] as const;
export type ColorMode = (typeof COLOR_MODES)[number];
export type ResolvedColorMode = 'light' | 'dark';

export interface ThemeConfig {
  preset: string;
  mode: ColorMode;
  density: DensityMode;
  motion: MotionIntensity;
  radius: ShapePreset;
  fontFamily: FontFamily;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  preset: 'modern-saas',
  mode: 'system',
  density: 'comfortable',
  motion: 'standard',
  radius: 'medium',
  fontFamily: 'Geist',
};

/** Names of the CSS custom properties that carry colour tokens. */
const COLOR_VARS: Array<[cssName: string, key: keyof ColorScale, rgb: boolean]> = [
  ['canvas', 'canvas', true],
  ['surface', 'surface', true],
  ['surface-elevated', 'surfaceElevated', true],
  ['border', 'border', true],
  ['text', 'text', true],
  ['text-muted', 'textMuted', true],
  ['primary', 'primary', true],
  ['primary-foreground', 'primaryForeground', false],
  ['secondary', 'secondary', true],
  ['secondary-foreground', 'secondaryForeground', false],
  ['accent', 'accent', true],
  ['accent-foreground', 'accentForeground', false],
  ['success', 'success', true],
  ['success-foreground', 'successForeground', false],
  ['warning', 'warning', true],
  ['warning-foreground', 'warningForeground', false],
  ['danger', 'danger', true],
  ['danger-foreground', 'dangerForeground', false],
  ['info', 'info', true],
  ['info-foreground', 'infoForeground', false],
];

export function colorVariables(colors: ColorScale): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [name, key, withRgb] of COLOR_VARS) {
    vars[`--${name}`] = colors[key];
    if (withRgb) vars[`--${name}-rgb`] = hexToRgbChannels(colors[key]);
  }
  return vars;
}

export function radiusVariables(shape: ShapePreset): Record<string, string> {
  const r = radiusPresets[shape];
  return {
    '--radius-sm': r.sm,
    '--radius-md': r.md,
    '--radius-lg': r.lg,
    '--radius-xl': r.xl,
    '--radius-full': r.full,
    '--radius-card': r.card,
    '--radius-button': r.button,
    '--radius-input': r.input,
  };
}

export function densityVariables(mode: DensityMode): Record<string, string> {
  const d = densityConfigs[mode];
  return {
    '--row-height': d.tableRowHeight,
    '--nav-padding': d.navItemPadding,
    '--topbar-height': d.topBarHeight,
    '--card-padding': d.cardPadding,
    '--input-height': d.inputHeight,
  };
}

const block = (selector: string, vars: Record<string, string>) =>
  `${selector}{${Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')}}`;

/**
 * Static CSS for every preset, radius and density. Rendered into the document head so the
 * first paint already uses the right tokens, before any JavaScript runs.
 */
export function generateThemeCss(presets: Record<string, ThemePreset>): string {
  const rules: string[] = [];
  for (const preset of Object.values(presets)) {
    for (const mode of ['light', 'dark'] as const) {
      rules.push(
        block(`html[data-preset="${preset.id}"][data-mode="${mode}"]`, {
          ...colorVariables(preset.colors[mode]),
          'color-scheme': mode,
        }),
      );
    }
  }
  for (const shape of Object.keys(radiusPresets) as ShapePreset[]) {
    rules.push(block(`html[data-radius="${shape}"]`, radiusVariables(shape)));
  }
  for (const mode of Object.keys(densityConfigs) as DensityMode[]) {
    rules.push(block(`html[data-density="${mode}"]`, densityVariables(mode)));
  }
  return rules.join('\n');
}

const isOneOf = <T extends string>(value: unknown, allowed: readonly T[]): value is T =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value);

/**
 * Parse untrusted persisted theme settings. Unknown keys and invalid values are dropped so a
 * stale or tampered localStorage entry can never crash the theme engine.
 */
export function sanitizeThemeConfig(input: unknown, presetIds: readonly string[]): Partial<ThemeConfig> {
  if (!input || typeof input !== 'object') return {};
  const raw = input as Record<string, unknown>;
  const out: Partial<ThemeConfig> = {};
  if (isOneOf(raw.preset, presetIds)) out.preset = raw.preset;
  if (isOneOf(raw.mode, COLOR_MODES)) out.mode = raw.mode;
  if (isOneOf(raw.density, Object.keys(densityConfigs) as DensityMode[])) out.density = raw.density;
  if (isOneOf(raw.motion, Object.keys(motionMultiplier) as MotionIntensity[])) out.motion = raw.motion;
  if (isOneOf(raw.radius, Object.keys(radiusPresets) as ShapePreset[])) out.radius = raw.radius;
  if (isOneOf(raw.fontFamily, Object.keys(fontFamilies) as FontFamily[])) out.fontFamily = raw.fontFamily;
  return out;
}

export const THEME_STORAGE_KEY = 'nexus_theme_preferences';

/**
 * Tiny inline script that runs before first paint: it resolves the stored (or default) mode
 * and preset and writes the data attributes the generated CSS keys off. This removes the
 * light/dark and preset flash on load.
 */
export function getThemeInitScript(
  presets: Record<string, ThemePreset>,
  defaults: ThemeConfig = DEFAULT_THEME_CONFIG,
): string {
  const presetDefaults = Object.fromEntries(
    Object.values(presets).map((p) => [p.id, { radius: p.radius, density: p.density, motion: p.motion }]),
  );
  const payload = JSON.stringify({ key: THEME_STORAGE_KEY, defaults, presetDefaults });
  return `(function(){try{var c=${payload},d=document.documentElement,s={};` +
    `try{s=JSON.parse(localStorage.getItem(c.key)||"{}")||{}}catch(e){}` +
    `var p=c.presetDefaults[s.preset]?s.preset:c.defaults.preset,pd=c.presetDefaults[p]||{},` +
    `m=s.mode==="light"||s.mode==="dark"||s.mode==="system"?s.mode:c.defaults.mode,` +
    `r=m==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):m;` +
    `d.dataset.mode=r;d.dataset.preset=p;d.dataset.radius=s.radius||pd.radius||c.defaults.radius;` +
    `d.dataset.density=s.density||pd.density||c.defaults.density;d.dataset.motion=s.motion||pd.motion||c.defaults.motion;` +
    `d.classList.add(r);d.style.colorScheme=r}catch(e){}})();`;
}

/** Apply a resolved theme to an element: CSS variables, data attributes and the dark class. */
export function applyThemeToElement(
  element: HTMLElement,
  preset: ThemePreset,
  resolvedMode: ResolvedColorMode,
  config: Partial<ThemeConfig> = {},
) {
  const shape = config.radius || preset.radius;
  const densityMode = config.density || preset.density;
  const motionSetting = config.motion || preset.motion;
  const fontSetting = config.fontFamily || preset.fontFamily;

  const vars: Record<string, string> = {
    ...colorVariables(preset.colors[resolvedMode]),
    ...radiusVariables(shape),
    ...densityVariables(densityMode),
    '--font-family-sans': fontFamilies[fontSetting],
    '--motion-duration-multiplier': motionMultiplier[motionSetting].toString(),
  };
  for (const [name, value] of Object.entries(vars)) element.style.setProperty(name, value);

  element.setAttribute('data-mode', resolvedMode);
  element.setAttribute('data-preset', preset.id);
  element.setAttribute('data-density', densityMode);
  element.setAttribute('data-motion', motionSetting);
  element.setAttribute('data-radius', shape);
  element.style.colorScheme = resolvedMode;

  element.classList.toggle('dark', resolvedMode === 'dark');
  element.classList.toggle('light', resolvedMode === 'light');
}
