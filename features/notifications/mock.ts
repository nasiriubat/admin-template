import { ApiError } from '@nexus/api-client';
import { mockRouter } from '../_shared/mock-router';
import { minutesAgo } from '../_shared/mock-utils';
import type { Notification } from './types';

let items: Notification[] = [
  { id: 'n-001', title: 'Deployment finished', body: 'Release 2026.10.2 is live in production. All health checks passed.', createdAt: minutesAgo(6), read: false, tone: 'success', href: '/health' },
  { id: 'n-002', title: 'New user invited', body: 'Priya Singh was invited as an Editor by Avery Morgan.', createdAt: minutesAgo(38), read: false, tone: 'info', href: '/users' },
  { id: 'n-003', title: 'Elevated API error rate', body: 'The orders endpoint returned 4.2% 5xx responses over the last 15 minutes.', createdAt: minutesAgo(74), read: false, tone: 'danger', href: '/logs' },
  { id: 'n-004', title: 'Webhook delivery failing', body: 'hooks.example.com/v2/orders has failed 5 deliveries in a row. Retries continue for 24 hours.', createdAt: minutesAgo(190), read: false, tone: 'warning', href: '/webhooks' },
  { id: 'n-005', title: 'API key expires soon', body: 'The “Data warehouse sync” key expires in 7 days. Rotate it to avoid downtime.', createdAt: minutesAgo(60 * 9), read: true, tone: 'warning', href: '/api-keys' },
  { id: 'n-006', title: 'Role permissions updated', body: 'Jordan Lee granted Audit Log access to the Support Agent role.', createdAt: minutesAgo(60 * 26), read: true, tone: 'info', href: '/audit' },
  { id: 'n-007', title: 'Weekly report is ready', body: 'Your workspace summary for the week ending Sunday is available to export.', createdAt: minutesAgo(60 * 31), read: true, tone: 'success', href: '/analytics' },
  { id: 'n-008', title: 'Background job failed', body: 'Nightly search reindex stopped after 3 retries. See the job log for the stack trace.', createdAt: minutesAgo(60 * 50), read: true, tone: 'danger', href: '/jobs' },
  { id: 'n-009', title: 'New sign-in from Helsinki', body: 'Your account was used to sign in from Chrome on macOS. If this wasn’t you, change your password.', createdAt: minutesAgo(60 * 72), read: true, tone: 'info', href: '/account' },
  { id: 'n-010', title: 'Storage at 82%', body: 'File storage is nearing its plan limit. Remove unused files or upgrade your plan.', createdAt: minutesAgo(60 * 120), read: true, tone: 'warning', href: '/files' },
];

const find = (id: string) => {
  const item = items.find((n) => n.id === id);
  if (!item) throw new ApiError('NOT_FOUND', 'Notification not found.', 404);
  return item;
};

mockRouter.on('GET', '/notifications', () => [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
mockRouter.on('POST', '/notifications/read-all', () => {
  items = items.map((n) => ({ ...n, read: true }));
  return { affected: items.length };
});
mockRouter.on('PATCH', '/notifications/:id', ({ params, body }) => {
  const patch = body as { read: boolean };
  const next = { ...find(params.id), read: Boolean(patch.read) };
  items = items.map((n) => (n.id === next.id ? next : n));
  return next;
});
mockRouter.on('DELETE', '/notifications/:id', ({ params }) => {
  find(params.id);
  items = items.filter((n) => n.id !== params.id);
  return { id: params.id };
});
