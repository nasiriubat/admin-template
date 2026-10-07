import { z } from '../_shared/zod';

export const FLAG_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const description = z.string().trim().max(200, 'Keep the description under 200 characters.');
const owner = z.string().trim().min(2, 'Enter the owning team or person.').max(60, 'Keep it under 60 characters.');
const rollout = z
  .number({ message: 'Enter a number between 0 and 100.' })
  .int('Use a whole number.')
  .min(0, 'Rollout cannot be below 0%.')
  .max(100, 'Rollout cannot be above 100%.');

/** Create schema. `existingKeys` lets the client flag duplicates early; the server stays authoritative. */
export function createFlagSchema(existingKeys: readonly string[] = []) {
  const taken = new Set(existingKeys.map((k) => k.toLowerCase()));
  return z.object({
    key: z
      .string()
      .trim()
      .min(3, 'Use at least 3 characters.')
      .max(60, 'Keep the key under 60 characters.')
      .regex(FLAG_KEY_PATTERN, 'Use lowercase letters, numbers and single hyphens (kebab-case).')
      .refine((k) => !taken.has(k), 'A flag with this key already exists.'),
    description,
    owner,
  });
}

export const updateFlagSchema = z.object({ description, owner, rollout });

export type CreateFlagValues = z.output<ReturnType<typeof createFlagSchema>>;
export type UpdateFlagValues = z.output<typeof updateFlagSchema>;
