import { ApiError, createCollection } from '@nexus/api-client';
import { createRng, daysAgo, minutesAgo } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import { deriveStatus } from './key-utils';
import type { CreateApiKeyRequest } from './schemas';
import type { ApiKey } from './types';

const rng = createRng(20260402);
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const fragment = (n: number) => Array.from({ length: n }, () => ALPHABET[rng.int(0, ALPHABET.length - 1)]).join('');

const SEED: Array<[string, string[], number, number | null, number | null, boolean]> = [
  ['Production backend', ['users:read', 'users:write', 'files:read'], 210, 150, 14, false],
  ['Analytics exporter', ['analytics:read'], 120, 240, 2, false],
  ['CI deploy pipeline', ['webhooks:manage', 'jobs:read'], 95, 270, 90, false],
  ['Mobile app (iOS)', ['users:read', 'files:read', 'files:write'], 60, 305, 1, false],
  ['Data warehouse sync', ['users:read', 'analytics:read', 'jobs:read'], 180, 185, 400, false],
  ['Zapier integration', ['users:read'], 45, 320, 7, false],
  ['Old staging key', ['users:read', 'users:write'], 300, 65, 120, false],
  ['Contractor access (Q2)', ['files:read'], 150, 215, 40, true],
  ['Support tooling', ['users:read', 'jobs:read'], 30, 335, 3, false],
  ['Legacy importer', ['users:write', 'files:write'], 400, 0, 220, true],
];

const seed: ApiKey[] = SEED.map(([name, scopes, createdDays, expiresInDays, lastUsedMinutes, revoked], i) => {
  const createdAt = daysAgo(createdDays);
  const expiresAt = expiresInDays === null ? null : new Date(new Date(createdAt).getTime() + expiresInDays * 86_400_000).toISOString();
  const key: ApiKey = {
    id: `key-${String(i + 1).padStart(3, '0')}`,
    name,
    prefix: `nxk_live_${fragment(4)}`,
    last4: fragment(4),
    scopes,
    status: 'active',
    createdAt,
    lastUsedAt: lastUsedMinutes === null ? null : minutesAgo(lastUsedMinutes * 60),
    expiresAt,
    revokedAt: revoked ? daysAgo(createdDays - 80) : null,
  };
  return { ...key, status: deriveStatus(key) };
});

let rows: ApiKey[] = seed;
const view = () => createCollection<ApiKey>(rows.map((k) => ({ ...k, status: deriveStatus(k) })), {
  searchFields: ['name', 'prefix'],
  filterFields: ['status'],
  defaultSort: { field: 'createdAt', direction: 'desc' },
});

function randomSecret(length: number) {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else bytes.forEach((_, i) => (bytes[i] = Math.floor(Math.random() * 256)));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

mockRouter.on('GET', '/api-keys', ({ query }) => view().list(query));
mockRouter.on('POST', '/api-keys', ({ body }) => {
  const input = body as CreateApiKeyRequest;
  if (rows.some((k) => k.name.toLowerCase() === input.name.toLowerCase() && k.status !== 'revoked')) {
    throw new ApiError('VALIDATION_ERROR', 'Some of the information provided is not valid.', 422, { name: 'A key with this name already exists.' });
  }
  const secret = `nxk_live_${randomSecret(32)}`;
  const now = new Date();
  const key: ApiKey = {
    id: `key-${Date.now().toString(36)}`,
    name: input.name,
    prefix: secret.slice(0, 13),
    last4: secret.slice(-4),
    scopes: input.scopes,
    status: 'active',
    createdAt: now.toISOString(),
    lastUsedAt: null,
    expiresAt: input.expiresInDays === null ? null : new Date(now.getTime() + input.expiresInDays * 86_400_000).toISOString(),
    revokedAt: null,
  };
  rows = [key, ...rows];
  // The secret is returned exactly once and is not retained by the mock (a real API stores only a hash).
  return { key, secret };
});
mockRouter.on('POST', '/api-keys/:id/revoke', ({ params }) => {
  const current = rows.find((k) => k.id === params.id);
  if (!current) throw new ApiError('NOT_FOUND', 'Key not found.', 404);
  if (current.revokedAt) throw new ApiError('CONFLICT', 'This key is already revoked.', 409);
  const next: ApiKey = { ...current, revokedAt: new Date().toISOString(), status: 'revoked' };
  rows = rows.map((k) => (k.id === next.id ? next : k));
  return next;
});
