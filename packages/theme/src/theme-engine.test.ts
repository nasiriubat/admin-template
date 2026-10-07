import { describe, expect, it } from 'vitest';
import { defaultPresets } from './presets';
import { applyThemeToElement, generateThemeCss, getThemeInitScript, sanitizeThemeConfig, DEFAULT_THEME_CONFIG } from './theme-engine';

const ids = Object.keys(defaultPresets);

describe('sanitizeThemeConfig', () => {
  it('keeps valid values', () => {
    expect(sanitizeThemeConfig({ preset: 'professional', mode: 'dark', density: 'compact', radius: 'pill' }, ids)).toEqual({
      preset: 'professional', mode: 'dark', density: 'compact', radius: 'pill',
    });
  });
  it('drops unknown or malicious values instead of crashing', () => {
    expect(sanitizeThemeConfig({ preset: '__proto__', mode: 'sepia', radius: 'huge', density: 5, extra: 1 }, ids)).toEqual({});
    expect(sanitizeThemeConfig(null, ids)).toEqual({});
    expect(sanitizeThemeConfig('x', ids)).toEqual({});
  });
});

describe('generateThemeCss', () => {
  const css = generateThemeCss(defaultPresets);
  it('emits light and dark rules for every preset plus radius and density', () => {
    for (const id of ids) {
      expect(css).toContain(`html[data-preset="${id}"][data-mode="light"]`);
      expect(css).toContain(`html[data-preset="${id}"][data-mode="dark"]`);
    }
    expect(css).toContain('html[data-radius="pill"]');
    expect(css).toContain('html[data-density="compact"]');
    expect(css).toContain('--primary-rgb:');
  });
});

describe('getThemeInitScript', () => {
  it('is syntactically valid and sets attributes from stored preferences', () => {
    localStorage.setItem('nexus_theme_preferences', JSON.stringify({ preset: 'data-dense', mode: 'dark' }));
    new Function(getThemeInitScript(defaultPresets))();
    const d = document.documentElement;
    expect(d.dataset.preset).toBe('data-dense');
    expect(d.dataset.mode).toBe('dark');
    expect(d.dataset.density).toBe(defaultPresets['data-dense'].density);
    expect(d.classList.contains('dark')).toBe(true);
  });
  it('ignores corrupt storage and falls back to defaults', () => {
    localStorage.setItem('nexus_theme_preferences', '{not json');
    document.documentElement.removeAttribute('data-preset');
    new Function(getThemeInitScript(defaultPresets))();
    expect(document.documentElement.dataset.preset).toBe(DEFAULT_THEME_CONFIG.preset);
  });
});

describe('applyThemeToElement', () => {
  it('writes tokens, attributes and color-scheme', () => {
    const el = document.createElement('html');
    applyThemeToElement(el, defaultPresets['modern-saas'], 'dark', { radius: 'large', density: 'spacious' });
    expect(el.style.getPropertyValue('--canvas')).toBe(defaultPresets['modern-saas'].colors.dark.canvas);
    expect(el.style.getPropertyValue('--radius-card')).toBe('1rem');
    expect(el.getAttribute('data-mode')).toBe('dark');
    expect(el.classList.contains('dark')).toBe(true);
    expect(el.style.colorScheme).toBe('dark');
  });
});
