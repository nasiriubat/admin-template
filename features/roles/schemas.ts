import { z } from 'zod';

export const ROLE_NAME_MIN = 2;
export const ROLE_NAME_MAX = 40;

/** Build the create-role schema. `existingNames` makes the name check case-insensitively unique. */
export function createRoleSchema(existingNames: readonly string[]) {
  const taken = new Set(existingNames.map((n) => n.trim().toLowerCase()));
  return z.object({
    name: z
      .string()
      .trim()
      .min(ROLE_NAME_MIN, `Enter at least ${ROLE_NAME_MIN} characters.`)
      .max(ROLE_NAME_MAX, `Keep it under ${ROLE_NAME_MAX + 1} characters.`)
      .refine((v) => !taken.has(v.toLowerCase()), 'A role with this name already exists.'),
    description: z.string().trim().max(160, 'Keep it under 160 characters.').optional().default(''),
    /** Optional role to copy permissions from. */
    copyFrom: z.string().optional().default(''),
  });
}

export type CreateRoleInput = z.input<ReturnType<typeof createRoleSchema>>;
export type CreateRoleValues = z.output<ReturnType<typeof createRoleSchema>>;
