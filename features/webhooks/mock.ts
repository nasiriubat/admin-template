import { ApiError, createCollection } from '@nexus/api-client';
import { createRng, daysAgo, minutesAgo } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import type { WebhookFormValues } from './schemas';
import type { TestEventResult, Webhook, WebhookDelivery, WebhookWithSecret } from './types';
import { deriveWebhookStatus } from './webhook-utils';

const rng = createRng(20260521);
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const fragment = (n: number) => Array.from({ length: n }, () => ALPHABET[rng.int(0, ALPHABET.length - 1)]).join('');

const SEED: Array<[string, string, string[], boolean, number, number | null]> = [
  ['https://api.acme-crm.com/hooks/nexus', 'Sync new users into the CRM', ['user.created', 'user.updated', 'user.deleted'], true, 99, 4],
  ['https://hooks.slack-relay.io/services/T01/ops-alerts', 'Ops channel alerts', ['job.failed', 'key.revoked'], true, 97, 22],
  ['https://billing.northwind.dev/webhooks/events', 'Billing provider integration', ['user.created', 'key.created'], true, 62, 9],
  ['https://events.datasink.example.org/ingest', 'Data warehouse ingest', ['user.created', 'user.updated', 'file.uploaded', 'job.completed'], true, 100, 1],
  ['https://audit.securevault.net/v1/nexus', 'Security audit trail', ['key.created', 'key.revoked', 'user.deleted'], true, 94, 35],
  ['https://staging.partner-portal.io/callbacks', 'Partner staging environment', ['file.uploaded'], false, 88, 60 * 24 * 3],
  ['https://ci.buildbox.example.com/triggers/nexus', 'Trigger CI on job completion', ['job.completed', 'job.failed'], true, 71, 15],
];

const seed: Webhook[] = SEED.map(([url, description, events, enabled, successRate, lastMinutes], i) => {
  const base = {
    id: `wh-${String(i + 1).padStart(3, '0')}`,
    url,
    description,
    events,
    enabled,
    successRate,
    lastDeliveryAt: lastMinutes === null ? null : minutesAgo(lastMinutes),
    secretPrefix: 'whsec_',
    secretLast4: fragment(4),
    createdAt: daysAgo(30 + i * 23),
  };
  return { ...base, status: deriveWebhookStatus(base) };
});

let rows: Webhook[] = seed;
const deliveriesById = new Map<string, WebhookDelivery[]>();

const view = () =>
  createCollection<Webhook>(rows, {
    searchFields: ['url', 'description'],
    filterFields: ['status'],
    defaultSort: { field: 'createdAt', direction: 'desc' },
  });

function find(id: string) {
  const row = rows.find((w) => w.id === id);
  if (!row) throw new ApiError('NOT_FOUND', 'Webhook not found.', 404);
  return row;
}
function save(next: Webhook) {
  const withStatus = { ...next, status: deriveWebhookStatus(next) };
  rows = rows.map((w) => (w.id === withStatus.id ? withStatus : w));
  return withStatus;
}

function deliveriesFor(webhook: Webhook): WebhookDelivery[] {
  const existing = deliveriesById.get(webhook.id);
  if (existing) return existing;
  const r = createRng(webhook.id.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7));
  const list: WebhookDelivery[] = Array.from({ length: 12 }, (_, i) => {
    const ok = r.chance(webhook.successRate / 100);
    const attempt = ok ? 1 : r.int(1, 3);
    return {
      id: `${webhook.id}-d${i + 1}`,
      event: r.pick(webhook.events),
      statusCode: ok ? r.pick([200, 200, 200, 202, 204]) : r.pick([500, 502, 503, 504, 429]),
      durationMs: ok ? r.int(80, 420) : r.int(900, 5000),
      timestamp: minutesAgo(i * r.int(20, 90) + 3),
      attempt,
      success: ok,
    };
  });
  deliveriesById.set(webhook.id, list);
  return list;
}

mockRouter.on('GET', '/webhooks', ({ query }) => view().list(query));
mockRouter.on('GET', '/webhooks/:id/deliveries', ({ params }) => deliveriesFor(find(params.id)));
mockRouter.on('POST', '/webhooks', ({ body }) => {
  const input = body as WebhookFormValues;
  if (rows.some((w) => w.url === input.url)) {
    throw new ApiError('VALIDATION_ERROR', 'Some of the information provided is not valid.', 422, { url: 'An endpoint with this URL already exists.' });
  }
  const secret = `whsec_${fragment(32)}`;
  const webhook: Webhook = {
    id: `wh-${Date.now().toString(36)}`,
    url: input.url,
    description: input.description,
    events: input.events,
    enabled: true,
    status: 'enabled',
    lastDeliveryAt: null,
    successRate: 100,
    secretPrefix: 'whsec_',
    secretLast4: secret.slice(-4),
    createdAt: new Date().toISOString(),
  };
  rows = [webhook, ...rows];
  return { webhook, secret } satisfies WebhookWithSecret;
});
mockRouter.on('PATCH', '/webhooks/:id', ({ params, body }) => {
  const patch = body as Partial<Pick<Webhook, 'url' | 'description' | 'events' | 'enabled'>>;
  return save({ ...find(params.id), ...patch });
});
mockRouter.on('POST', '/webhooks/:id/rotate-secret', ({ params }) => {
  const secret = `whsec_${fragment(32)}`;
  const webhook = save({ ...find(params.id), secretLast4: secret.slice(-4) });
  return { webhook, secret } satisfies WebhookWithSecret;
});
mockRouter.on('POST', '/webhooks/:id/test', ({ params }) => {
  const webhook = find(params.id);
  const failing = webhook.status === 'failing';
  const result: TestEventResult = { success: !failing, statusCode: failing ? 503 : 200, durationMs: failing ? 2400 : 180 };
  const entry: WebhookDelivery = {
    id: `${webhook.id}-t${Date.now().toString(36)}`,
    event: 'webhook.test',
    statusCode: result.statusCode,
    durationMs: result.durationMs,
    timestamp: new Date().toISOString(),
    attempt: 1,
    success: result.success,
  };
  deliveriesById.set(webhook.id, [entry, ...deliveriesFor(webhook)]);
  save({ ...webhook, lastDeliveryAt: entry.timestamp });
  return result;
});
mockRouter.on('DELETE', '/webhooks/:id', ({ params }) => {
  find(params.id);
  rows = rows.filter((w) => w.id !== params.id);
  deliveriesById.delete(params.id);
  return { id: params.id };
});
