/**
 * Elevation and shadow tokens per docs/DESIGN_SYSTEM.md:
 * - border only
 * - subtle shadow
 * - medium shadow
 * - strong floating shadow
 */

export const elevationTokens = {
  borderOnly: 'none',
  subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
  strongFloating: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
} as const;
