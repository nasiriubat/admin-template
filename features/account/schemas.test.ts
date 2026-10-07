import { describe, expect, it } from 'vitest';
import { changePasswordSchema, passwordSchema, profileSchema } from './schemas';

describe('passwordSchema', () => {
  it('requires length and variety', () => {
    expect(passwordSchema.safeParse('short1A').success).toBe(false);
    expect(passwordSchema.safeParse('alllowercaseletters').success).toBe(false);
    expect(passwordSchema.safeParse('Correct-horse-battery').success).toBe(true);
  });
});

describe('changePasswordSchema', () => {
  const ok = { current: 'old-password-1', password: 'Brand-new-pass9', confirm: 'Brand-new-pass9' };
  it('accepts a valid change', () => {
    expect(changePasswordSchema.safeParse(ok).success).toBe(true);
  });
  it('flags a mismatched confirmation on the confirm field', () => {
    const r = changePasswordSchema.safeParse({ ...ok, confirm: 'different' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.some((i) => i.path[0] === 'confirm')).toBe(true);
  });
  it('rejects reusing the current password', () => {
    expect(changePasswordSchema.safeParse({ current: ok.password, password: ok.password, confirm: ok.password }).success).toBe(false);
  });
});

describe('profileSchema', () => {
  it('normalises email and requires a name', () => {
    expect(profileSchema.parse({ name: 'Ada Lovelace', email: ' ADA@Example.com ', timezone: 'UTC' }).email).toBe('ada@example.com');
    expect(profileSchema.safeParse({ name: 'A', email: 'a@example.com', timezone: 'UTC' }).success).toBe(false);
  });
});
