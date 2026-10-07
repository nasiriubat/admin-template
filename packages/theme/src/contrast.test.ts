import { describe, expect, it } from 'vitest';
import { presetList } from './presets';
import { contrastRatio, mixHex } from './tokens/colors';

const MODES = ['light', 'dark'] as const;
const FILLS = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info'] as const;
const TEXT_ROLES = ['primary', 'accent', 'success', 'warning', 'danger', 'info'] as const;

describe.each(presetList.map((p) => [p.id, p] as const))('%s preset contrast (WCAG AA 4.5:1)', (_id, preset) => {
  describe.each(MODES)('%s mode', (mode) => {
    const c = preset.colors[mode];
    const surfaces = [c.canvas, c.surface, c.surfaceElevated];

    it('body and muted text are readable on every surface', () => {
      for (const bg of surfaces) {
        expect(contrastRatio(c.text, bg)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(c.textMuted, bg)).toBeGreaterThanOrEqual(4.5);
      }
    });

    it('muted text stays readable on tinted surfaces (selected rows, alerts)', () => {
      for (const bg of surfaces) {
        for (const key of TEXT_ROLES) {
          expect(contrastRatio(c.textMuted, mixHex(bg, c[key], 0.15)), `muted on ${key} tint`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });

    it('foreground text is readable on every filled semantic colour', () => {
      for (const key of FILLS) {
        const fg = c[`${key}Foreground` as keyof typeof c];
        expect(contrastRatio(fg, c[key]), `${key} foreground`).toBeGreaterThanOrEqual(4.5);
      }
    });

    it('semantic colours stay readable on their own 15% tint (badges, avatars, alerts)', () => {
      for (const key of TEXT_ROLES) {
        for (const bg of surfaces) {
          expect(contrastRatio(c[key], mixHex(bg, c[key], 0.15)), `${key} tint on ${bg}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });

    it('semantic colours are readable as text on canvas and surface', () => {
      for (const key of TEXT_ROLES) {
        expect(contrastRatio(c[key], c.canvas), `${key} on canvas`).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(c[key], c.surface), `${key} on surface`).toBeGreaterThanOrEqual(4.5);
      }
    });
  });
});
