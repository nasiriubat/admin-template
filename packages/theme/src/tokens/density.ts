/**
 * Density modes per docs/DESIGN_SYSTEM.md:
 * - comfortable (default)
 * - compact
 * - spacious
 */

export type DensityMode = 'compact' | 'comfortable' | 'spacious';

export interface DensityValues {
  tableRowHeight: string;
  navItemPadding: string;
  topBarHeight: string;
  cardPadding: string;
  inputHeight: string;
  baseSpacingMultiplier: number;
}

export const densityConfigs: Record<DensityMode, DensityValues> = {
  compact: {
    tableRowHeight: '2.25rem', // 36px
    navItemPadding: '0.375rem 0.625rem', // 6px 10px
    topBarHeight: '3.5rem', // 56px
    cardPadding: '1rem', // 16px
    inputHeight: '2rem', // 32px
    baseSpacingMultiplier: 0.85,
  },
  comfortable: {
    tableRowHeight: '3rem', // 48px
    navItemPadding: '0.5rem 0.75rem', // 8px 12px
    topBarHeight: '4rem', // 64px
    cardPadding: '1.5rem', // 24px
    inputHeight: '2.375rem', // 38px
    baseSpacingMultiplier: 1.0,
  },
  spacious: {
    tableRowHeight: '3.75rem', // 60px
    navItemPadding: '0.625rem 1rem', // 10px 16px
    topBarHeight: '4.5rem', // 72px
    cardPadding: '2rem', // 32px
    inputHeight: '2.75rem', // 44px
    baseSpacingMultiplier: 1.25,
  },
};
