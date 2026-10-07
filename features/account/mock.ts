import { ApiError } from '@nexus/api-client';
import { createRng, daysAgo, minutesAgo } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import type { AccountSession, LoginEvent, Profile } from './types';

const rng = createRng(20260707);

let profile: Profile = { name: 'Avery Morgan', email: 'admin@example.com', timezone: 'Europe/Helsinki' };

const PLACES = ['Helsinki, FI', 'Tampere, FI', 'Berlin, DE', 'London, GB', 'Lagos, NG', 'Austin, US'] as const;
const ip = () => `${rng.int(11, 223)}.${rng.int(0, 255)}.${rng.int(0, 255)}.${rng.int(1, 254)}`;

let sessions: AccountSession[] = [
  { id: 's-current', device: 'MacBook Pro', browser: 'Chrome 141', os: 'macOS 15', ip: ip(), location: PLACES[0], lastActiveAt: minutesAgo(1), createdAt: minutesAgo(190), current: true },
  { id: 's-2', device: 'iPhone 16', browser: 'Safari 19', os: 'iOS 19', ip: ip(), location: PLACES[0], lastActiveAt: minutesAgo(95), createdAt: daysAgo(6), current: false },
  { id: 's-3', device: 'Windows desktop', browser: 'Edge 140', os: 'Windows 11', ip: ip(), location: PLACES[2], lastActiveAt: daysAgo(2), createdAt: daysAgo(14), current: false },
  { id: 's-4', device: 'Pixel 9', browser: 'Chrome 141', os: 'Android 16', ip: ip(), location: PLACES[1], lastActiveAt: daysAgo(5), createdAt: daysAgo(21), current: false },
];

const FAIL_REASONS = ['Incorrect password', 'Incorrect password', 'Verification code expired'] as const;
const BROWSERS: Array<[string, string]> = [['Chrome 141', 'macOS 15'], ['Safari 19', 'iOS 19'], ['Edge 140', 'Windows 11'], ['Firefox 143', 'Linux']];

const history: LoginEvent[] = Array.from({ length: 20 }, (_, i) => {
  const failed = i === 2 || i === 7 || i === 13;
  const [browser, os] = failed ? BROWSERS[3] : BROWSERS[i % 3];
  return {
    id: `l-${i + 1}`,
    at: minutesAgo(40 + i * 60 * 11 + rng.int(0, 90)),
    success: !failed,
    reason: failed ? FAIL_REASONS[i % FAIL_REASONS.length] : null,
    ip: ip(),
    location: failed ? PLACES[4] : PLACES[i % 3],
    browser,
    os,
  };
});

mockRouter.on('GET', '/account/profile', () => profile);
mockRouter.on('PATCH', '/account/profile', ({ body }) => {
  const patch = body as Partial<Profile>;
  if (patch.email && patch.email.toLowerCase() === 'taken@example.com') {
    throw new ApiError('VALIDATION_ERROR', 'Some of the information provided is not valid.', 422, { email: 'That email is used by another account.' });
  }
  profile = { ...profile, ...patch };
  return profile;
});
mockRouter.on('POST', '/account/password', ({ body }) => {
  const { current } = body as { current: string };
  // Demo rule: this specific value stands in for "wrong current password".
  if (current === 'wrong-password') throw new ApiError('VALIDATION_ERROR', 'Some of the information provided is not valid.', 422, { current: 'Your current password is incorrect.' });
  return { changed: true };
});
mockRouter.on('GET', '/account/sessions', () => sessions);
mockRouter.on('DELETE', '/account/sessions/:id', ({ params }) => {
  const target = sessions.find((s) => s.id === params.id);
  if (!target) throw new ApiError('NOT_FOUND', 'That session no longer exists.', 404);
  if (target.current) throw new ApiError('BAD_REQUEST', 'You can’t revoke the session you’re using. Sign out instead.', 400);
  sessions = sessions.filter((s) => s.id !== params.id);
  return { id: params.id };
});
mockRouter.on('POST', '/account/sessions/revoke-others', () => {
  const revoked = sessions.filter((s) => !s.current).length;
  sessions = sessions.filter((s) => s.current);
  return { revoked };
});
mockRouter.on('GET', '/account/login-history', () => history);
