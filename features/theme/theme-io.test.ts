import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME_CONFIG, presetList } from '@nexus/theme';
import { buildThemeExport, contrastRows, parseThemeImport } from './theme-io';

const ids = presetList.map((p) => p.id);

describe('contrastRows', () => {
  it('computes ratios and AA pass/fail', () => {
    const colors = { ...presetList[0].colors.light, text: '#000000', canvas: '#ffffff', textMuted: '#cccccc', surface: '#ffffff' };
    const rows = contrastRows(colors);
    const text = rows.find((r) => r.id === 'text-canvas')!;
    expect(Math.round(text.ratio)).toBe(21);
    expect(text.pass).toBe(true);
    expect(rows.find((r) => r.id === 'muted-canvas')!.pass).toBe(false);
  });
});

describe('theme export/import', () => {
  it('round-trips an exported config', () => {
    const result = parseThemeImport(buildThemeExport({ ...DEFAULT_THEME_CONFIG, preset: 'professional', mode: 'dark' }), ids);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.config).toMatchObject({ preset: 'professional', mode: 'dark', density: 'comfortable' });
  });
  it('accepts a bare config and reports ignored keys', () => {
    const result = parseThemeImport('{"mode":"light","density":"huge","extra":1}', ids);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config).toEqual({ mode: 'light' });
      expect(result.ignored).toEqual(['density', 'extra']);
    }
  });
  it('rejects invalid JSON, non-objects and files with no valid values', () => {
    expect(parseThemeImport('{oops', ids)).toMatchObject({ ok: false });
    expect(parseThemeImport('[1,2]', ids)).toMatchObject({ ok: false });
    expect(parseThemeImport('{"preset":"nope"}', ids)).toMatchObject({ ok: false });
  });
});
