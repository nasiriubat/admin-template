import { describe, expect, it } from 'vitest';
import { canCancel, canRetry, computeStats, formatDuration, queueShares, retryableIds } from './jobs-utils';

describe('job rules', () => {
  it('retries only failed, cancels only queued or running', () => {
    expect(canRetry({ status: 'failed' })).toBe(true);
    expect(canRetry({ status: 'succeeded' })).toBe(false);
    expect(canCancel({ status: 'queued' })).toBe(true);
    expect(canCancel({ status: 'running' })).toBe(true);
    expect(canCancel({ status: 'failed' })).toBe(false);
  });
  it('picks retryable ids from a selection', () => {
    expect(retryableIds([{ id: 'a', status: 'failed' }, { id: 'b', status: 'queued' }, { id: 'c', status: 'failed' }])).toEqual(['a', 'c']);
  });
});

describe('formatDuration', () => {
  it('formats across scales', () => {
    expect(formatDuration(null)).toBe('—');
    expect(formatDuration(240)).toBe('240 ms');
    expect(formatDuration(1500)).toBe('1.5 s');
    expect(formatDuration(42_000)).toBe('42 s');
    expect(formatDuration(120_000)).toBe('2 min');
    expect(formatDuration(125_000)).toBe('2 min 5 s');
  });
});

describe('computeStats', () => {
  const now = Date.parse('2026-02-01T12:00:00Z');
  const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();
  const stats = computeStats(
    [
      { queue: 'emails', status: 'queued', createdAt: hoursAgo(1) },
      { queue: 'emails', status: 'succeeded', createdAt: hoursAgo(2) },
      { queue: 'emails', status: 'succeeded', createdAt: hoursAgo(30) },
      { queue: 'reports', status: 'failed', createdAt: hoursAgo(5) },
      { queue: 'reports', status: 'running', createdAt: hoursAgo(0.1) },
      { queue: 'custom', status: 'cancelled', createdAt: hoursAgo(5) },
    ],
    ['emails', 'reports', 'imports'],
    now,
  );
  it('counts totals', () => {
    expect(stats).toMatchObject({ queued: 1, running: 1, failed: 1, completed24h: 1 });
  });
  it('breaks down by queue, keeping empty and unknown queues', () => {
    expect(stats.queues.map((q) => q.name)).toEqual(['emails', 'reports', 'imports', 'custom']);
    expect(stats.queues[0]).toMatchObject({ queued: 1, succeeded: 2 });
    expect(stats.queues[2]).toMatchObject({ queued: 0, failed: 0 });
  });
  it('computes bar shares', () => {
    expect(queueShares({ name: 'x', queued: 1, running: 1, failed: 1, succeeded: 1 }).failed).toBe(25);
    expect(queueShares({ name: 'x', queued: 0, running: 0, failed: 0, succeeded: 0 }).total).toBe(0);
  });
});
