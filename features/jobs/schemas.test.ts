import { describe, expect, it } from 'vitest';
import { bulkRetrySchema } from './schemas';

describe('bulkRetrySchema', () => {
  it('accepts a list of ids', () => {
    expect(bulkRetrySchema.safeParse({ ids: ['job_1', 'job_2'] }).success).toBe(true);
  });
  it('rejects empty, blank and oversized selections', () => {
    expect(bulkRetrySchema.safeParse({ ids: [] }).success).toBe(false);
    expect(bulkRetrySchema.safeParse({ ids: [''] }).success).toBe(false);
    expect(bulkRetrySchema.safeParse({ ids: Array.from({ length: 101 }, (_, i) => `j${i}`) }).success).toBe(false);
    expect(bulkRetrySchema.safeParse({}).success).toBe(false);
  });
});
