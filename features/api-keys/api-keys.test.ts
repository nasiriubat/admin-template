import { describe, expect, it } from 'vitest';
import { createApiKeySchema } from './schemas';
import { canRevoke, deriveStatus, expiryToDays, maskKey, toCreateRequest, toggleScope } from './key-utils';

describe('createApiKeySchema', () => {
  const ok = { name: 'CI pipeline', scopes: ['users:read'], expiry: '90' as const };
  it('accepts a valid input', () => expect(createApiKeySchema.safeParse(ok).success).toBe(true));
  it('requires at least one scope', () => expect(createApiKeySchema.safeParse({ ...ok, scopes: [] }).success).toBe(false));
  it('rejects unknown scopes and expiries', () => {
    expect(createApiKeySchema.safeParse({ ...ok, scopes: ['root:all'] }).success).toBe(false);
    expect(createApiKeySchema.safeParse({ ...ok, expiry: '7' }).success).toBe(false);
  });
  it('requires a name of 3-60 characters', () => {
    expect(createApiKeySchema.safeParse({ ...ok, name: 'ab' }).success).toBe(false);
    expect(createApiKeySchema.safeParse({ ...ok, name: 'x'.repeat(61) }).success).toBe(false);
  });
});

describe('key utils', () => {
  it('masks the key to prefix and last four only', () => expect(maskKey({ prefix: 'nxk_live_ab12', last4: 'wxyz' })).toBe('nxk_live_ab12••••wxyz'));
  it('maps expiry presets to days', () => {
    expect(expiryToDays('30')).toBe(30);
    expect(expiryToDays('365')).toBe(365);
    expect(expiryToDays('never')).toBeNull();
    expect(toCreateRequest({ name: 'n', scopes: ['a'], expiry: 'never' }).expiresInDays).toBeNull();
  });
  it('derives status with revoked as terminal', () => {
    const now = Date.parse('2026-06-01T00:00:00Z');
    expect(deriveStatus({ revokedAt: '2026-01-01T00:00:00Z', expiresAt: null }, now)).toBe('revoked');
    expect(deriveStatus({ revokedAt: '2026-01-01T00:00:00Z', expiresAt: '2025-01-01T00:00:00Z' }, now)).toBe('revoked');
    expect(deriveStatus({ revokedAt: null, expiresAt: '2026-05-01T00:00:00Z' }, now)).toBe('expired');
    expect(deriveStatus({ revokedAt: null, expiresAt: null }, now)).toBe('active');
  });
  it('only active keys can be revoked', () => {
    expect(canRevoke({ status: 'active' })).toBe(true);
    expect(canRevoke({ status: 'revoked' })).toBe(false);
    expect(canRevoke({ status: 'expired' })).toBe(false);
  });
  it('toggles scopes without duplicates', () => {
    expect(toggleScope(['a'], 'b', true)).toEqual(['a', 'b']);
    expect(toggleScope(['a', 'b'], 'a', false)).toEqual(['b']);
    expect(toggleScope(['a'], 'a', true)).toEqual(['a']);
  });
});
