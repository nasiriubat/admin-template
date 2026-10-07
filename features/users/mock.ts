import { ApiError, createCollection } from '@nexus/api-client';
import { createRng, daysAgo, FIRST_NAMES, LAST_NAMES, minutesAgo } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import type { User, UserStatus, BulkUserAction } from './types';

const rng = createRng(20260101);
const ROLES = ['admin', 'editor', 'editor', 'viewer', 'viewer', 'viewer'] as const;

const seed: User[] = Array.from({ length: 48 }, (_, i) => {
  const first = FIRST_NAMES[i % FIRST_NAMES.length];
  const last = LAST_NAMES[(i * 7 + 3) % LAST_NAMES.length];
  const status: UserStatus = i % 11 === 0 ? 'suspended' : i % 7 === 0 ? 'invited' : 'active';
  return {
    id: `u-${String(i + 1).padStart(3, '0')}`,
    name: `${first} ${last}`,
    email: `${first}.${last}${i > 20 ? i : ''}@example.com`.toLowerCase(),
    role: i === 0 ? 'super-admin' : rng.pick(ROLES),
    status,
    createdAt: daysAgo(rng.int(5, 400)),
    lastActiveAt: status === 'invited' ? null : minutesAgo(rng.int(3, 60 * 24 * 30)),
  };
});

export const usersCollection = createCollection<User>(seed, {
  searchFields: ['name', 'email'],
  filterFields: ['role', 'status'],
  defaultSort: { field: 'createdAt', direction: 'desc' },
});

function assertUniqueEmail(email: string, exceptId?: string) {
  const clash = usersCollection.all().some((u) => u.email === email.toLowerCase() && u.id !== exceptId);
  if (clash) throw new ApiError('VALIDATION_ERROR', 'Some of the information provided is not valid.', 422, { email: 'A user with this email already exists.' });
}

mockRouter.on('GET', '/users', ({ query }) => usersCollection.list(query));
mockRouter.on('GET', '/users/:id', ({ params }) => usersCollection.get(params.id));
mockRouter.on('POST', '/users', ({ body }) => {
  const input = body as Pick<User, 'name' | 'email' | 'role' | 'status'>;
  assertUniqueEmail(input.email);
  return usersCollection.create({ ...input, email: input.email.toLowerCase(), status: input.status ?? 'invited', createdAt: new Date().toISOString(), lastActiveAt: null });
});
mockRouter.on('PATCH', '/users/:id', ({ params, body }) => {
  const patch = body as Partial<User>;
  if (patch.email) {
    patch.email = patch.email.toLowerCase();
    assertUniqueEmail(patch.email, params.id);
  }
  return usersCollection.update(params.id, patch);
});
mockRouter.on('DELETE', '/users/:id', ({ params }) => usersCollection.remove(params.id));
mockRouter.on('POST', '/users/bulk', ({ body }) => {
  const { ids, action } = body as { ids: string[]; action: BulkUserAction };
  for (const id of ids) {
    if (action === 'delete') usersCollection.remove(id);
    else usersCollection.update(id, { status: action === 'suspend' ? 'suspended' : 'active' });
  }
  return { affected: ids.length };
});
