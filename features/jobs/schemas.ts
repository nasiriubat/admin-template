import { z } from '../_shared/zod';

/** Body of POST /jobs/retry. Bulk retry always names the jobs explicitly. */
export const bulkRetrySchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Select at least one job.').max(100, 'Retry at most 100 jobs at a time.'),
});

export type BulkRetryInput = z.infer<typeof bulkRetrySchema>;
