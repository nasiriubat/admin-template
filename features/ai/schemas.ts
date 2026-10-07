import { z } from '../_shared/zod';
import { parseTags } from './ai-utils';

const httpsUrl = z
  .string()
  .trim()
  .min(1, 'Base URL is required.')
  .refine((v) => {
    try {
      return new URL(v).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Enter a valid https:// URL.');

const apiKey = z.string().trim().min(8, 'API keys are at least 8 characters.').max(300, 'That key is too long.');

const providerBase = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters.').max(60, 'Keep it under 60 characters.'),
  type: z.enum(['openai-compatible', 'anthropic', 'local'], { message: 'Choose a provider type.' }),
  baseUrl: httpsUrl,
  /** Write-only. Empty on edit means "keep the stored key". */
  apiKey: z.union([z.literal(''), apiKey]).optional(),
});

/** `create` requires a key (except local runtimes); `edit` treats an empty key as unchanged. */
export const providerFormSchema = (mode: 'create' | 'edit') =>
  providerBase.superRefine((value, ctx) => {
    if (mode === 'create' && value.type !== 'local' && !value.apiKey) {
      ctx.addIssue({ code: 'custom', path: ['apiKey'], message: 'API key is required.' });
    }
  });

export type ProviderFormInput = z.input<typeof providerBase>;
export type ProviderFormValues = z.output<typeof providerBase>;

export const pricingSchema = z.object({
  inputPrice: z.coerce.number({ message: 'Enter a number.' }).min(0, 'Price cannot be negative.').max(1000, 'That looks too high.'),
  outputPrice: z.coerce.number({ message: 'Enter a number.' }).min(0, 'Price cannot be negative.').max(1000, 'That looks too high.'),
});
export type PricingInput = z.input<typeof pricingSchema>;
export type PricingValues = z.output<typeof pricingSchema>;

export const promptFormSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters.').max(80, 'Keep it under 80 characters.'),
  description: z.string().trim().max(200, 'Keep it under 200 characters.'),
  tags: z.string().trim().max(120, 'Keep tags under 120 characters.').refine((v) => parseTags(v).length <= 6, 'Use at most 6 tags.'),
  template: z.string().min(1, 'The template cannot be empty.').max(8000, 'Keep the template under 8,000 characters.'),
  note: z.string().trim().max(120, 'Keep the note under 120 characters.'),
});
export type PromptFormInput = z.input<typeof promptFormSchema>;
export type PromptFormValues = z.output<typeof promptFormSchema>;

