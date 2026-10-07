import { ANALYTICS_RANGES, type AnalyticsRange } from './types';

export const RANGE_DAYS: Record<AnalyticsRange, number> = { '7d': 7, '30d': 30, '90d': 90 };

export function parseRange(value: unknown): AnalyticsRange {
  return ANALYTICS_RANGES.find((r) => r === value) ?? '30d';
}

/** "+12.4%" / "-3%" / "0%". */
export function formatDelta(delta: number): string {
  const rounded = Math.round(delta * 10) / 10;
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

/** 205 -> "3m 25s", 42 -> "42s". */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
}

export const formatPercent = (value: number) => `${Math.round(value * 10) / 10}%`;

/** Sum of the daily values per weekday; Monday first. */
export function weekdayTotals(rows: Array<{ date: string; value: number }>): Array<{ day: string; sessions: number }> {
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const totals = names.map(() => 0);
  for (const row of rows) {
    const idx = (new Date(`${row.date}T00:00:00Z`).getUTCDay() + 6) % 7;
    totals[idx] += row.value;
  }
  return names.map((day, i) => ({ day, sessions: totals[i] }));
}

/** Percentage change from previous to current; 0 when there is no baseline. */
export function percentChange(current: number, previous: number): number {
  if (!previous) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
