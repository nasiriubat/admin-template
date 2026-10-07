import { describe, expect, it } from 'vitest';
import { formatDelta, formatDuration, parseRange, percentChange, weekdayTotals } from './helpers';

describe('analytics helpers', () => {
  it('parses ranges with a safe default', () => {
    expect(parseRange('7d')).toBe('7d');
    expect(parseRange('bogus')).toBe('30d');
    expect(parseRange(undefined)).toBe('30d');
  });
  it('formats deltas and durations', () => {
    expect(formatDelta(12.44)).toBe('+12.4%');
    expect(formatDelta(-3)).toBe('-3%');
    expect(formatDelta(0)).toBe('0%');
    expect(formatDuration(42)).toBe('42s');
    expect(formatDuration(205)).toBe('3m 25s');
    expect(formatDuration(125)).toBe('2m 05s');
  });
  it('computes percent change without dividing by zero', () => {
    expect(percentChange(110, 100)).toBe(10);
    expect(percentChange(5, 0)).toBe(0);
  });
  it('groups values by weekday, Monday first', () => {
    // 2026-01-05 is a Monday, 2026-01-11 a Sunday.
    const out = weekdayTotals([
      { date: '2026-01-05', value: 10 },
      { date: '2026-01-12', value: 5 },
      { date: '2026-01-11', value: 7 },
    ]);
    expect(out[0]).toEqual({ day: 'Mon', sessions: 15 });
    expect(out[6]).toEqual({ day: 'Sun', sessions: 7 });
  });
});
