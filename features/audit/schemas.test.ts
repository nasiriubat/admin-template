import { describe, expect, it } from 'vitest';
import { validateDateRange } from './schemas';

describe('validateDateRange', () => {
  it('accepts empty, open-ended and ordered ranges', () => {
    expect(validateDateRange({ from: '', to: '' })).toBeNull();
    expect(validateDateRange({ from: '2026-01-01', to: '' })).toBeNull();
    expect(validateDateRange({ from: '', to: '2026-01-01' })).toBeNull();
    expect(validateDateRange({ from: '2026-01-01', to: '2026-01-01' })).toBeNull();
    expect(validateDateRange({ from: '2026-01-01', to: '2026-02-01' })).toBeNull();
  });

  it('rejects from after to', () => {
    expect(validateDateRange({ from: '2026-03-02', to: '2026-03-01' })).toMatch(/on or after/);
  });

  it('rejects malformed dates', () => {
    expect(validateDateRange({ from: '03/01/2026', to: '' })).toMatch(/valid date/);
  });
});
