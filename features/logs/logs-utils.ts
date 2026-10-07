import type { LogEntry, TimeRange } from './types';
import { TIME_RANGES } from './types';

export function rangeMinutes(range: TimeRange | string | undefined): number | null {
  return TIME_RANGES.find((r) => r.value === range)?.minutes ?? null;
}

/** Keep entries newer than the preset window. An unknown or empty range keeps everything. */
export function filterByRange<T extends { timestamp: string }>(rows: readonly T[], range: string | undefined, now = Date.now()): T[] {
  const minutes = rangeMinutes(range);
  if (minutes === null) return [...rows];
  const cutoff = now - minutes * 60_000;
  return rows.filter((r) => Date.parse(r.timestamp) >= cutoff);
}

export function formatContext(context: Record<string, unknown>): string {
  return JSON.stringify(context, null, 2);
}

export const LOG_CSV_HEADERS = ['Timestamp', 'Level', 'Service', 'Message', 'Request ID', 'Context'];

export function logRowsForCsv(entries: readonly LogEntry[]): unknown[][] {
  return entries.map((e) => [e.timestamp, e.level, e.service, e.message, e.requestId, JSON.stringify(e.context)]);
}

/** Live tail only follows the newest entries: it needs page 1 sorted by time, newest first. */
export function liveTailPauseReason(opts: { page: number; sort?: string; direction: 'asc' | 'desc'; paused: boolean }): string | null {
  if (opts.paused) return 'Paused by you';
  if (opts.page !== 1) return 'Paused while browsing older pages';
  if (opts.sort && !(opts.sort === 'timestamp' && opts.direction === 'desc')) return 'Paused while sorted by another column';
  return null;
}
