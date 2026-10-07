import { describe, expect, it } from 'vitest';
import { filterByRange, formatContext, liveTailPauseReason, logRowsForCsv, rangeMinutes } from './logs-utils';
import type { LogEntry } from './types';

const now = Date.parse('2026-05-01T12:00:00Z');
const at = (minutesBack: number) => ({ timestamp: new Date(now - minutesBack * 60_000).toISOString() });

describe('time range', () => {
  it('maps presets to minutes', () => {
    expect(rangeMinutes('15m')).toBe(15);
    expect(rangeMinutes('7d')).toBe(10080);
    expect(rangeMinutes('')).toBeNull();
  });
  it('filters rows to the window', () => {
    const rows = [at(5), at(30), at(300), at(3000)];
    expect(filterByRange(rows, '15m', now)).toHaveLength(1);
    expect(filterByRange(rows, '1h', now)).toHaveLength(2);
    expect(filterByRange(rows, '24h', now)).toHaveLength(3);
    expect(filterByRange(rows, undefined, now)).toHaveLength(4);
  });
});

describe('csv and context', () => {
  const entry: LogEntry = { id: '1', timestamp: '2026-05-01T11:00:00Z', level: 'error', service: 'api', message: 'Boom, "really"', requestId: 'req_1', context: { status: 500 } };
  it('serialises rows', () => {
    expect(logRowsForCsv([entry])).toEqual([['2026-05-01T11:00:00Z', 'error', 'api', 'Boom, "really"', 'req_1', '{"status":500}']]);
  });
  it('pretty prints context', () => {
    expect(formatContext(entry.context)).toBe('{\n  "status": 500\n}');
  });
});

describe('liveTailPauseReason', () => {
  const base = { page: 1, sort: 'timestamp', direction: 'desc' as const, paused: false };
  it('is null when following the newest entries', () => {
    expect(liveTailPauseReason(base)).toBeNull();
    expect(liveTailPauseReason({ ...base, sort: undefined })).toBeNull();
  });
  it('pauses for manual pause, other pages and other sorts', () => {
    expect(liveTailPauseReason({ ...base, paused: true })).toBe('Paused by you');
    expect(liveTailPauseReason({ ...base, page: 2 })).toMatch(/older pages/);
    expect(liveTailPauseReason({ ...base, sort: 'level' })).toMatch(/another column/);
    expect(liveTailPauseReason({ ...base, direction: 'asc' })).toMatch(/another column/);
  });
});
