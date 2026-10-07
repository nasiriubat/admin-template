import { describe, expect, it } from 'vitest';
import { generalSchema, isValidDomain, normalizeDomain, securitySchema } from './schemas';
import { DEFAULT_SETTINGS } from './types';

describe('domain helpers', () => {
  it('normalises and validates domains', () => {
    expect(normalizeDomain(' @Example.COM ')).toBe('example.com');
    expect(isValidDomain('mail.example.co.uk')).toBe(true);
    expect(isValidDomain('localhost')).toBe(false);
    expect(isValidDomain('exa mple.com')).toBe(false);
  });
});

describe('generalSchema', () => {
  it('accepts the defaults', () => {
    expect(generalSchema.safeParse(DEFAULT_SETTINGS.general).success).toBe(true);
  });
  it('rejects a bad email and unknown timezone', () => {
    const r = generalSchema.safeParse({ ...DEFAULT_SETTINGS.general, supportEmail: 'nope', timezone: 'Mars/Base' });
    expect(r.success).toBe(false);
  });
});

describe('securitySchema', () => {
  it('accepts the defaults', () => {
    expect(securitySchema.safeParse(DEFAULT_SETTINGS.security).success).toBe(true);
  });
  it('dedupes and lowercases domains', () => {
    const r = securitySchema.parse({ ...DEFAULT_SETTINGS.security, allowedDomains: ['Example.com', 'example.com'] });
    expect(r.allowedDomains).toEqual(['example.com']);
  });
  it('enforces numeric bounds and domain validity', () => {
    expect(securitySchema.safeParse({ ...DEFAULT_SETTINGS.security, sessionTimeoutMinutes: 1 }).success).toBe(false);
    expect(securitySchema.safeParse({ ...DEFAULT_SETTINGS.security, passwordMinLength: 4 }).success).toBe(false);
    expect(securitySchema.safeParse({ ...DEFAULT_SETTINGS.security, allowedDomains: ['not a domain'] }).success).toBe(false);
  });
});
