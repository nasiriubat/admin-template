/**
 * Typography tokens per docs/DESIGN_SYSTEM.md:
 * Approved fonts: Geist, Inter, Manrope, IBM Plex Sans.
 * Roles: display, h1, h2, h3, section label, body, small, caption, code.
 */

export type FontFamily = 'Geist' | 'Inter' | 'Manrope' | 'IBM Plex Sans';

export const fontFamilies: Record<FontFamily, string> = {
  Geist: 'var(--font-geist, "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
  Inter: 'var(--font-inter, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
  Manrope: 'var(--font-manrope, "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
  'IBM Plex Sans': 'var(--font-ibm-plex, "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
};

export const typographyRoles = {
  display: {
    fontSize: '2.5rem', // 40px
    lineHeight: '1.2',
    fontWeight: '700',
    letterSpacing: '-0.025em',
  },
  h1: {
    fontSize: '2rem', // 32px
    lineHeight: '1.25',
    fontWeight: '600',
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '1.5rem', // 24px
    lineHeight: '1.3',
    fontWeight: '600',
    letterSpacing: '-0.015em',
  },
  h3: {
    fontSize: '1.25rem', // 20px
    lineHeight: '1.4',
    fontWeight: '600',
    letterSpacing: '-0.01em',
  },
  sectionLabel: {
    fontSize: '0.75rem', // 12px
    lineHeight: '1rem',
    fontWeight: '600',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  body: {
    fontSize: '0.9375rem', // 15px
    lineHeight: '1.5',
    fontWeight: '400',
  },
  small: {
    fontSize: '0.8125rem', // 13px
    lineHeight: '1.4',
    fontWeight: '400',
  },
  caption: {
    fontSize: '0.75rem', // 12px
    lineHeight: '1.4',
    fontWeight: '400',
  },
  code: {
    fontSize: '0.8125rem', // 13px
    lineHeight: '1.4',
    fontWeight: '400',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
} as const;
