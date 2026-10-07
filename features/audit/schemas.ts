import { z } from 'zod';

/** Date-range filter: both ends optional (`YYYY-MM-DD`), but `from` may not be after `to`. */
export const dateRangeSchema = z
  .object({
    from: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Use a valid date.'),
    to: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Use a valid date.'),
  })
  .refine((v) => !v.from || !v.to || v.from <= v.to, { path: ['to'], message: 'End date must be on or after the start date.' });

export type DateRange = z.infer<typeof dateRangeSchema>;

/** First validation message for a range, or null when it is usable. */
export function validateDateRange(range: DateRange): string | null {
  const result = dateRangeSchema.safeParse(range);
  return result.success ? null : result.error.issues[0].message;
}
