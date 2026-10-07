import type { Job, JobStatus, QueueStats } from './types';

export const canRetry = (job: Pick<Job, 'status'>) => job.status === 'failed';
export const canCancel = (job: Pick<Job, 'status'>) => job.status === 'queued' || job.status === 'running';

export function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
}

export function retryableIds(rows: ReadonlyArray<Pick<Job, 'id' | 'status'>>): string[] {
  return rows.filter(canRetry).map((r) => r.id);
}

/** Roll jobs up into per-queue and overall counters. `completed24h` counts successes in the last day. */
export function computeStats(jobs: ReadonlyArray<Pick<Job, 'queue' | 'status' | 'createdAt'>>, queues: readonly string[], now = Date.now()) {
  const byQueue = new Map<string, QueueStats>(queues.map((name) => [name, { name, queued: 0, running: 0, failed: 0, succeeded: 0 }]));
  let completed24h = 0;
  const totals: Record<JobStatus, number> = { queued: 0, running: 0, succeeded: 0, failed: 0, cancelled: 0 };
  for (const job of jobs) {
    totals[job.status] += 1;
    const q = byQueue.get(job.queue) ?? { name: job.queue, queued: 0, running: 0, failed: 0, succeeded: 0 };
    byQueue.set(job.queue, q);
    if (job.status === 'queued') q.queued += 1;
    else if (job.status === 'running') q.running += 1;
    else if (job.status === 'failed') q.failed += 1;
    else if (job.status === 'succeeded') {
      q.succeeded += 1;
      if (now - Date.parse(job.createdAt) <= 24 * 3_600_000) completed24h += 1;
    }
  }
  return { queued: totals.queued, running: totals.running, failed: totals.failed, completed24h, queues: [...byQueue.values()] };
}

/** Share of a queue's jobs per bucket, as whole-number percentages for the breakdown bar. */
export function queueShares(q: QueueStats) {
  const total = q.queued + q.running + q.failed + q.succeeded;
  const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100);
  return { total, queued: pct(q.queued), running: pct(q.running), failed: pct(q.failed), succeeded: pct(q.succeeded) };
}
