import { describe, expect, it } from 'vitest';
import { createRoleSchema } from './schemas';

describe('createRoleSchema', () => {
  const schema = createRoleSchema(['Admin', 'Support Agent']);

  it('accepts a valid new name and applies defaults', () => {
    const result = schema.safeParse({ name: '  Auditor ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({ name: 'Auditor', description: '', copyFrom: '' });
  });

  it('rejects too short and too long names', () => {
    expect(schema.safeParse({ name: 'A' }).success).toBe(false);
    expect(schema.safeParse({ name: 'x'.repeat(40) }).success).toBe(true);
    expect(schema.safeParse({ name: 'x'.repeat(41) }).success).toBe(false);
  });

  it('rejects duplicate names case-insensitively', () => {
    const result = schema.safeParse({ name: 'support agent' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toMatch(/already exists/);
  });
});
