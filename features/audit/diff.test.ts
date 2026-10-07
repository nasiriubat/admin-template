import { describe, expect, it } from 'vitest';
import { diffValues, formatValue } from './diff';

describe('diffValues', () => {
  it('classifies added, removed, changed and unchanged keys', () => {
    const result = diffValues({ role: 'viewer', status: 'active', legacy: true }, { role: 'editor', status: 'active', plan: 'pro' });
    expect(Object.fromEntries(result.map((e) => [e.key, e.kind]))).toEqual({ role: 'changed', status: 'unchanged', legacy: 'removed', plan: 'added' });
  });

  it('treats a missing side as all-added or all-removed', () => {
    expect(diffValues(null, { a: 1 }).every((e) => e.kind === 'added')).toBe(true);
    expect(diffValues({ a: 1 }, null).every((e) => e.kind === 'removed')).toBe(true);
    expect(diffValues(null, null)).toEqual([]);
  });

  it('compares arrays by rendered value', () => {
    expect(diffValues({ p: ['a', 'b'] }, { p: ['a', 'b'] })[0].kind).toBe('unchanged');
    expect(diffValues({ p: ['a'] }, { p: ['a', 'b'] })[0].kind).toBe('changed');
  });
});

describe('formatValue', () => {
  it('renders readable text', () => {
    expect(formatValue(null)).toBe('—');
    expect(formatValue(['a', 'b'])).toBe('a, b');
    expect(formatValue([])).toBe('(empty)');
    expect(formatValue(false)).toBe('false');
    expect(formatValue({ a: 1 })).toBe('{"a":1}');
  });
});
