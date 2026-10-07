import { createCollection } from '@nexus/api-client';
import { createRng, minutesAgo } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import { filterByRange } from './logs-utils';
import type { LOG_SERVICES, LogEntry, LogLevel } from './types';

const rng = createRng(20260512);

interface Template {
  service: (typeof LOG_SERVICES)[number];
  level: LogLevel;
  message: string;
  context: () => Record<string, unknown>;
}

const route = () => rng.pick(['/v1/users', '/v1/projects', '/v1/invoices', '/v1/files', '/v1/sessions']);
const userId = () => `u-${String(rng.int(1, 48)).padStart(3, '0')}`;

const TEMPLATES: Template[] = [
  { service: 'api', level: 'info', message: 'Request completed', context: () => ({ method: rng.pick(['GET', 'GET', 'POST', 'PATCH']), path: route(), status: 200, durationMs: rng.int(8, 240) }) },
  { service: 'api', level: 'info', message: 'Request completed', context: () => ({ method: 'GET', path: route(), status: 304, durationMs: rng.int(3, 40) }) },
  { service: 'api', level: 'warn', message: 'Slow request exceeded 1s threshold', context: () => ({ path: route(), durationMs: rng.int(1000, 4200), threshold: 1000 }) },
  { service: 'api', level: 'error', message: 'Unhandled exception in request handler', context: () => ({ path: route(), status: 500, error: 'TypeError: Cannot read properties of undefined (reading \'id\')', stack: ['at resolveOwner (owner.ts:42:19)', 'at handler (projects.ts:118:7)'] }) },
  { service: 'auth', level: 'info', message: 'User signed in', context: () => ({ userId: userId(), method: 'password', ip: `203.0.113.${rng.int(1, 250)}` }) },
  { service: 'auth', level: 'warn', message: 'Failed sign-in attempt', context: () => ({ email: 'j.lee@example.com', reason: 'INVALID_CREDENTIALS', attempt: rng.int(1, 4), ip: `198.51.100.${rng.int(1, 250)}` }) },
  { service: 'auth', level: 'warn', message: 'Session token refresh rejected', context: () => ({ userId: userId(), reason: 'token_expired' }) },
  { service: 'worker', level: 'info', message: 'Job completed', context: () => ({ job: rng.pick(['SendWelcomeEmail', 'SyncSearchIndex', 'DeliverWebhook']), durationMs: rng.int(40, 5200), attempt: 1 }) },
  { service: 'worker', level: 'error', message: 'Job failed and will be retried', context: () => ({ job: 'DeliverWebhook', attempt: rng.int(1, 4), error: 'ETIMEDOUT: endpoint did not respond within 10s', endpoint: 'https://hooks.example.org/receive' }) },
  { service: 'worker', level: 'debug', message: 'Polling queue for work', context: () => ({ queue: rng.pick(['default', 'emails', 'webhooks']), pending: rng.int(0, 14) }) },
  { service: 'billing', level: 'info', message: 'Invoice generated', context: () => ({ invoiceId: `inv_${rng.int(10000, 99999)}`, amountCents: rng.int(900, 49900), currency: 'EUR' }) },
  { service: 'billing', level: 'error', message: 'Payment provider returned an error', context: () => ({ provider: 'payments', code: 'card_declined', customerId: `cus_${rng.int(1000, 9999)}` }) },
  { service: 'search', level: 'debug', message: 'Index segment merged', context: () => ({ index: 'records-v3', segments: rng.int(3, 9), tookMs: rng.int(80, 900) }) },
  { service: 'search', level: 'warn', message: 'Index lag above target', context: () => ({ lagSeconds: rng.int(20, 180), target: 15 }) },
  { service: 'mailer', level: 'info', message: 'Email accepted by provider', context: () => ({ template: rng.pick(['welcome', 'password-reset', 'invoice']), messageId: `msg_${rng.int(100000, 999999)}` }) },
  { service: 'mailer', level: 'warn', message: 'Provider rate limit reached, backing off', context: () => ({ retryAfterSeconds: rng.int(5, 60), queued: rng.int(10, 120) }) },
  { service: 'scheduler', level: 'info', message: 'Scheduled task started', context: () => ({ task: rng.pick(['prune-sessions', 'rollup-metrics', 'send-digests']) }) },
  { service: 'scheduler', level: 'debug', message: 'Next run calculated', context: () => ({ cron: '*/15 * * * *', nextRunInMinutes: rng.int(1, 15) }) },
];

const requestId = () => `req_${rng.int(0x100000, 0xffffff).toString(16)}${rng.int(0x1000, 0xffff).toString(16)}`;

let counter = 0;
function makeEntry(minutesBack: number): LogEntry {
  const t = rng.pick(TEMPLATES);
  counter += 1;
  return {
    id: `log-${String(counter).padStart(5, '0')}`,
    timestamp: minutesAgo(minutesBack),
    level: t.level,
    service: t.service,
    message: t.message,
    requestId: requestId(),
    context: t.context(),
  };
}

const seed: LogEntry[] = [];
let back = 0.2;
for (let i = 0; i < 300; i += 1) {
  seed.push(makeEntry(back));
  back += rng.int(1, 60) / 4;
}

const options = {
  searchFields: ['message', 'service', 'requestId'] as Array<keyof LogEntry>,
  filterFields: ['level', 'service'] as Array<keyof LogEntry>,
  defaultSort: { field: 'timestamp' as const, direction: 'desc' as const },
};
const collection = createCollection<LogEntry>(seed, options);

/** New entries arrive over time so "Live tail" has something to show. */
let lastGenerated = Date.now();
function simulateIncoming() {
  const now = Date.now();
  let added = 0;
  while (now - lastGenerated >= 3_000 && added < 15) {
    lastGenerated += 3_000;
    collection.create({ ...makeEntry(0), timestamp: new Date(lastGenerated).toISOString() });
    added += 1;
  }
  if (now - lastGenerated >= 3_000) lastGenerated = now;
}

type Query = Parameters<typeof collection.list>[0];

function scoped(query: Query) {
  simulateIncoming();
  const range = typeof query['filter[range]'] === 'string' ? (query['filter[range]'] as string) : undefined;
  return createCollection<LogEntry>(filterByRange(collection.all(), range), options);
}

mockRouter.on('GET', '/logs', ({ query }) => scoped(query).list(query));
mockRouter.on('GET', '/logs/export', ({ query }) => {
  const filtered = scoped(query);
  const all: LogEntry[] = [];
  for (let page = 1; ; page += 1) {
    const result = filtered.list({ ...query, page, pageSize: 100 }) as unknown as { __meta: { pages: number }; data: LogEntry[] };
    all.push(...result.data);
    if (page >= result.__meta.pages) return all;
  }
});
