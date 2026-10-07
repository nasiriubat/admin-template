import { describe, expect, it } from 'vitest';
import { sourceFormSchema, validateDocument } from './schemas';

describe('validateDocument', () => {
  it('allows pdf, md, txt and docx under 10 MB', () => {
    for (const name of ['a.pdf', 'b.MD', 'c.txt', 'd.docx']) expect(validateDocument({ name, size: 1000 })).toBeNull();
  });
  it('rejects svg, html, extensionless, empty and oversized files', () => {
    expect(validateDocument({ name: 'x.svg', size: 10 })).toMatch(/not allowed/);
    expect(validateDocument({ name: 'x.html', size: 10 })).toMatch(/not allowed/);
    expect(validateDocument({ name: 'README', size: 10 })).toMatch(/extension/);
    expect(validateDocument({ name: 'a.pdf', size: 0 })).toMatch(/empty/);
    expect(validateDocument({ name: 'a.pdf', size: 10 * 1024 * 1024 + 1 })).toMatch(/10 MB/);
  });
});

describe('sourceFormSchema', () => {
  const base = { name: 'Docs', schedule: 'daily' as const };
  it('requires https URLs for web sources', () => {
    expect(sourceFormSchema.safeParse({ ...base, type: 'web', location: 'http://example.com' }).success).toBe(false);
    expect(sourceFormSchema.safeParse({ ...base, type: 'web', location: 'javascript:alert(1)' }).success).toBe(false);
    expect(sourceFormSchema.safeParse({ ...base, type: 'web', location: 'https://example.com' }).success).toBe(true);
  });
  it('validates type-specific fields', () => {
    expect(sourceFormSchema.safeParse({ ...base, type: 'github', location: 'not a repo' }).success).toBe(false);
    expect(sourceFormSchema.safeParse({ ...base, type: 'github', location: 'org/repo' }).success).toBe(true);
    expect(sourceFormSchema.safeParse({ ...base, type: 's3', location: 'my-bucket' }).success).toBe(false);
    expect(sourceFormSchema.safeParse({ ...base, type: 's3', location: 'my-bucket', credential: 'secret' }).success).toBe(true);
  });
});
