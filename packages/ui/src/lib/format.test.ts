import { describe, expect, it } from 'vitest';
import { formatBytes, formatRelative, initials } from './format';

describe('format helpers', () => {
  it('builds initials', () => {
    expect(initials('Avery Morgan')).toBe('AM');
    expect(initials('  prince ')).toBe('P');
    expect(initials('')).toBe('?');
  });
  it('formats byte sizes', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
  it('formats relative time', () => {
    const now = Date.parse('2026-01-01T12:00:00Z');
    expect(formatRelative(now - 5 * 60_000, now)).toBe('5 minutes ago');
    expect(formatRelative(now - 3 * 3_600_000, now)).toBe('3 hours ago');
    expect(formatRelative(now - 5_000, now)).toBe('just now');
    expect(formatRelative('not a date', now)).toBe('');
  });
});
