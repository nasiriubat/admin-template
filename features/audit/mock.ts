import { createCollection } from '@nexus/api-client';
import { mockRouter } from '../_shared/mock-router';
import { createRng, minutesAgo } from '../_shared/mock-utils';
import { AUDIT_ACTORS, type AuditAction, type AuditEvent, type AuditResourceType, type AuditValues } from './types';

const rng = createRng(20260315);
const IPS = ['203.0.113.24', '198.51.100.77', '192.0.2.145', '203.0.113.9', '198.51.100.12', '192.0.2.61'];
const AGENTS = [
  'Chrome 126 on macOS',
  'Firefox 128 on Windows 11',
  'Safari 17 on iOS 17',
  'Edge 126 on Windows 11',
  'Chrome 126 on Android 14',
];
const ROLES = ['viewer', 'editor', 'admin'];
const NAMES = ['Sasha Fischer', 'Omar Haddad', 'Lena Larsen', 'Yuki Tanaka', 'Amara Okafor', 'Tomas Novak'];

interface Change {
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  oldValue: AuditValues | null;
  newValue: AuditValues | null;
}

function build(i: number): Change {
  const n = rng.int(1, 48);
  const name = rng.pick(NAMES);
  switch (rng.int(0, 11)) {
    case 0:
      return { action: 'create', resourceType: 'user', resourceId: `u-${String(n).padStart(3, '0')}`, oldValue: null, newValue: { name, email: `${name.split(' ')[0].toLowerCase()}@example.com`, role: 'viewer', status: 'invited' } };
    case 1:
    case 2: {
      const from = rng.pick(ROLES);
      return { action: 'update', resourceType: 'user', resourceId: `u-${String(n).padStart(3, '0')}`, oldValue: { role: from, status: 'active' }, newValue: { role: rng.pick(ROLES.filter((r) => r !== from)), status: 'active' } };
    }
    case 3:
      return { action: 'delete', resourceType: 'user', resourceId: `u-${String(n).padStart(3, '0')}`, oldValue: { name, role: 'viewer', status: 'suspended' }, newValue: null };
    case 4:
      return { action: 'update', resourceType: 'role', resourceId: rng.pick(['editor', 'viewer', 'support-agent']), oldValue: { permissions: ['dashboard.view', 'users.view'] }, newValue: { permissions: ['dashboard.view', 'users.view', 'audit.view'] } };
    case 5:
      return rng.chance(0.5)
        ? { action: 'create', resourceType: 'api-key', resourceId: `key-${1000 + i}`, oldValue: null, newValue: { name: rng.pick(['CI deploy', 'Data warehouse sync', 'Mobile app']), scopes: ['read'], expiresInDays: 90 } }
        : { action: 'delete', resourceType: 'api-key', resourceId: `key-${1000 + i}`, oldValue: { name: 'Legacy integration', scopes: ['read', 'write'] }, newValue: null };
    case 6:
      return { action: 'update', resourceType: 'webhook', resourceId: `wh-${rng.int(1, 9)}`, oldValue: { url: 'https://hooks.example.com/v1/orders', active: true }, newValue: { url: 'https://hooks.example.com/v2/orders', active: true } };
    case 7:
      return { action: 'delete', resourceType: 'file', resourceId: `f-${rng.int(100, 400)}`, oldValue: { name: rng.pick(['Q3-report.pdf', 'brand-kit.zip', 'onboarding.mp4']), sizeKb: rng.int(120, 9000) }, newValue: null };
    case 8:
      return { action: 'update', resourceType: 'setting', resourceId: rng.pick(['security.mfa', 'general.timezone', 'notifications.digest']), oldValue: { value: 'off' }, newValue: { value: 'on' } };
    case 9:
      return { action: 'export', resourceType: rng.pick(['user', 'file'] as const), resourceId: 'bulk', oldValue: null, newValue: { format: 'csv', rows: rng.int(20, 480) } };
    case 10:
      return { action: 'logout', resourceType: 'session', resourceId: `s-${rng.int(1000, 9999)}`, oldValue: null, newValue: null };
    default:
      return { action: 'login', resourceType: 'session', resourceId: `s-${rng.int(1000, 9999)}`, oldValue: null, newValue: { method: rng.pick(['password', 'sso']), mfa: true } };
  }
}

const seed: AuditEvent[] = Array.from({ length: 150 }, (_, i) => {
  const actor = AUDIT_ACTORS[(i * 5 + rng.int(0, 3)) % AUDIT_ACTORS.length];
  const idx = rng.int(0, IPS.length - 1);
  return {
    id: `aud-${String(i + 1).padStart(4, '0')}`,
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    ...build(i),
    ip: IPS[idx],
    userAgent: AGENTS[(idx + i) % AGENTS.length],
    timestamp: minutesAgo(i * 47 + rng.int(1, 40)),
  };
});

const options = {
  searchFields: ['actorName', 'actorEmail', 'action', 'resourceType', 'resourceId', 'ip'] as Array<keyof AuditEvent>,
  filterFields: ['action', 'resourceType', 'actorId'] as Array<keyof AuditEvent>,
  defaultSort: { field: 'timestamp' as const, direction: 'desc' as const },
};

const day = (value: unknown) => (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null);

/** Read-only: the audit trail is append-only so there are no write routes. */
mockRouter.on('GET', '/audit', ({ query }) => {
  const from = day(query['filter[from]']);
  const to = day(query['filter[to]']);
  const fromMs = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity;
  const toMs = to ? new Date(`${to}T23:59:59.999`).getTime() : Infinity;
  const rows = seed.filter((e) => {
    const t = new Date(e.timestamp).getTime();
    return t >= fromMs && t <= toMs;
  });
  return createCollection<AuditEvent>(rows, options).list(query);
});
