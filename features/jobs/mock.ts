import { ApiError, createCollection } from '@nexus/api-client';
import { createRng, minutesAgo } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import { canCancel, canRetry, computeStats } from './jobs-utils';
import { bulkRetrySchema } from './schemas';
import { QUEUES, type Job, type JobError, type JobStatus } from './types';

const rng = createRng(20260218);

const KINDS: Array<{ name: string; queue: (typeof QUEUES)[number]; minMs: number; maxMs: number; error: JobError }> = [
  { name: 'SendWelcomeEmail', queue: 'emails', minMs: 200, maxMs: 1800, error: { message: 'SMTP 451: temporary failure, mailbox provider rate limited the request', stack: ['at deliver (mailer/transport.ts:88:11)', 'at SendWelcomeEmail.handle (jobs/send-welcome-email.ts:24:5)'] } },
  { name: 'SendInvoiceEmail', queue: 'emails', minMs: 300, maxMs: 2400, error: { message: 'Template "invoice" failed to render: missing variable "dueDate"', stack: ['at render (mailer/templates.ts:61:13)', 'at SendInvoiceEmail.handle (jobs/send-invoice-email.ts:19:7)'] } },
  { name: 'DeliverWebhook', queue: 'webhooks', minMs: 120, maxMs: 9000, error: { message: 'ETIMEDOUT: endpoint https://hooks.example.org/receive did not respond within 10s', stack: ['at post (webhooks/deliver.ts:47:9)', 'at DeliverWebhook.handle (jobs/deliver-webhook.ts:15:5)'] } },
  { name: 'GenerateMonthlyReport', queue: 'reports', minMs: 18000, maxMs: 140000, error: { message: 'Query exceeded statement timeout of 120000 ms', stack: ['at runQuery (reports/query.ts:132:17)', 'at GenerateMonthlyReport.handle (jobs/monthly-report.ts:40:3)'] } },
  { name: 'ImportContacts', queue: 'imports', minMs: 4000, maxMs: 95000, error: { message: 'Row 1204: "email" is not a valid email address', stack: ['at validateRow (imports/contacts.ts:77:11)', 'at ImportContacts.handle (jobs/import-contacts.ts:33:9)'] } },
  { name: 'SyncSearchIndex', queue: 'default', minMs: 600, maxMs: 7500, error: { message: 'Search cluster rejected bulk request: 429 too_many_requests', stack: ['at bulk (search/client.ts:54:15)', 'at SyncSearchIndex.handle (jobs/sync-search-index.ts:21:5)'] } },
  { name: 'PruneExpiredSessions', queue: 'default', minMs: 80, maxMs: 900, error: { message: 'Deadlock detected while deleting from "sessions"', stack: ['at exec (db/pool.ts:210:9)', 'at PruneExpiredSessions.handle (jobs/prune-sessions.ts:12:5)'] } },
];

function status(i: number): JobStatus {
  const roll = rng.int(1, 100);
  if (i < 6) return roll <= 50 ? 'running' : 'queued';
  if (roll <= 8) return 'queued';
  if (roll <= 11) return 'running';
  if (roll <= 24) return 'failed';
  if (roll <= 28) return 'cancelled';
  return 'succeeded';
}

const seed: Job[] = Array.from({ length: 120 }, (_, i) => {
  const kind = rng.pick(KINDS);
  const st = status(i);
  const attempts = st === 'queued' ? 0 : st === 'failed' ? rng.int(2, 5) : st === 'succeeded' ? (rng.chance(0.15) ? 2 : 1) : 1;
  const done = st === 'succeeded' || st === 'failed';
  return {
    id: `job_${(48210 - i).toString(36)}${rng.int(10, 99)}`,
    name: kind.name,
    queue: kind.queue,
    status: st,
    attempts,
    maxAttempts: 5,
    durationMs: done ? rng.int(kind.minMs, kind.maxMs) : null,
    createdAt: minutesAgo(i * 22 + rng.int(0, 20)),
    error: st === 'failed' ? kind.error : null,
  };
});

const jobs = createCollection<Job>(seed, {
  searchFields: ['id', 'name', 'queue'],
  filterFields: ['status', 'queue'],
  defaultSort: { field: 'createdAt', direction: 'desc' },
});

function retryJob(id: string) {
  const job = jobs.get(id);
  if (!canRetry(job)) throw new ApiError('CONFLICT', 'Only failed jobs can be retried.', 409);
  return jobs.update(id, { status: 'queued', error: null, durationMs: null });
}

mockRouter.on('GET', '/jobs', ({ query }) => jobs.list(query));
mockRouter.on('GET', '/jobs/stats', () => computeStats(jobs.all(), QUEUES));
mockRouter.on('POST', '/jobs/retry', ({ body }) => {
  const parsed = bulkRetrySchema.safeParse(body);
  if (!parsed.success) throw new ApiError('VALIDATION_ERROR', 'Some of the information provided is not valid.', 422, { ids: parsed.error.issues[0]?.message ?? 'Invalid selection.' });
  parsed.data.ids.forEach(retryJob);
  return { affected: parsed.data.ids.length };
});
mockRouter.on('POST', '/jobs/:id/retry', ({ params }) => retryJob(params.id));
mockRouter.on('POST', '/jobs/:id/cancel', ({ params }) => {
  const job = jobs.get(params.id);
  if (!canCancel(job)) throw new ApiError('CONFLICT', 'Only queued or running jobs can be cancelled.', 409);
  return jobs.update(params.id, { status: 'cancelled' });
});
