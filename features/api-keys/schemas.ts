import { z } from '../_shared/zod';
import { API_KEY_SCOPES } from './types';

const scopeIds = API_KEY_SCOPES.map((s) => s.value);

export const createApiKeySchema = z.object({
  name: z.string().trim().min(3, 'Use at least 3 characters.').max(60, 'Keep the name under 60 characters.'),
  scopes: z
    .array(z.string())
    .min(1, 'Select at least one scope.')
    .refine((list) => list.every((s) => scopeIds.includes(s)), 'Unknown scope selected.'),
  expiry: z.enum(['30', '90', '365', 'never'], { message: 'Choose an expiry.' }),
});

export type CreateApiKeyInput = z.input<typeof createApiKeySchema>;
export type CreateApiKeyValues = z.output<typeof createApiKeySchema>;

/** Payload sent to the API: the preset becomes a concrete number of days (null = never). */
export interface CreateApiKeyRequest {
  name: string;
  scopes: string[];
  expiresInDays: number | null;
}
