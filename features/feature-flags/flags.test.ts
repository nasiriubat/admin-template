import { describe, expect, it } from 'vitest';
import { applyToggle, clampRollout, matchesFlagFilters, patchFlagInPage } from './flag-utils';
import { createFlagSchema, updateFlagSchema } from './schemas';
import type { FeatureFlag } from './types';

const flag: FeatureFlag = {
  id: 'ff-1',
  key: 'new-checkout',
  description: '',
  environments: { production: false, staging: true, development: true },
  rollout: 20,
  owner: 'Growth',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('createFlagSchema', () => {
  const schema = createFlagSchema(['taken-key']);
  const base = { description: '', owner: 'Growth' };
  it('accepts kebab-case keys', () => expect(schema.safeParse({ ...base, key: 'dark-mode-v2' }).success).toBe(true));
  it.each(['ab', 'Upper-Case', 'double--hyphen', '-lead', 'trail-', 'has space', 'a'.repeat(61)])('rejects %s', (key) =>
    expect(schema.safeParse({ ...base, key }).success).toBe(false),
  );
  it('rejects duplicates case-insensitively', () => expect(schema.safeParse({ ...base, key: 'taken-key' }).success).toBe(false));
});

describe('updateFlagSchema', () => {
  const ok = { description: '', owner: 'Growth' };
  it('bounds rollout to 0-100 integers', () => {
    expect(updateFlagSchema.safeParse({ ...ok, rollout: 0 }).success).toBe(true);
    expect(updateFlagSchema.safeParse({ ...ok, rollout: 100 }).success).toBe(true);
    expect(updateFlagSchema.safeParse({ ...ok, rollout: 101 }).success).toBe(false);
    expect(updateFlagSchema.safeParse({ ...ok, rollout: -1 }).success).toBe(false);
    expect(updateFlagSchema.safeParse({ ...ok, rollout: 1.5 }).success).toBe(false);
    expect(updateFlagSchema.safeParse({ ...ok, rollout: Number.NaN }).success).toBe(false);
  });
});

describe('flag utils', () => {
  it('toggles one environment without mutating', () => {
    const next = applyToggle(flag, 'production', true);
    expect(next.environments.production).toBe(true);
    expect(flag.environments.production).toBe(false);
  });
  it('patches only the matching flag in a page', () => {
    const page = { items: [flag, { ...flag, id: 'ff-2' }], meta: { page: 1, pageSize: 10, total: 2, pages: 1 } };
    const out = patchFlagInPage(page, 'ff-2', (f) => applyToggle(f, 'production', true));
    expect(out?.items[0].environments.production).toBe(false);
    expect(out?.items[1].environments.production).toBe(true);
  });
  it('filters by environment and status', () => {
    expect(matchesFlagFilters(flag, 'production', 'enabled')).toBe(false);
    expect(matchesFlagFilters(flag, 'production', 'disabled')).toBe(true);
    expect(matchesFlagFilters(flag, '', 'enabled')).toBe(true);
    expect(matchesFlagFilters(flag, 'staging', '')).toBe(true);
  });
  it('clamps rollout', () => {
    expect(clampRollout(150)).toBe(100);
    expect(clampRollout(-5)).toBe(0);
    expect(clampRollout(Number.NaN)).toBe(0);
    expect(clampRollout(33.6)).toBe(34);
  });
});
