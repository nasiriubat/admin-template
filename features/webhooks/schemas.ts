import { z } from 'zod';
import { validateWebhookUrl } from './url-safety';
import { WEBHOOK_EVENTS } from './types';

const eventIds = WEBHOOK_EVENTS.map((e) => e.value);

export const webhookFormSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'URL is required.')
    .max(2048, 'Keep the URL under 2048 characters.')
    .superRefine((value, ctx) => {
      const message = validateWebhookUrl(value);
      if (message) ctx.addIssue({ code: 'custom', message });
    }),
  description: z.string().trim().max(120, 'Keep the description under 120 characters.'),
  events: z
    .array(z.string())
    .min(1, 'Select at least one event.')
    .refine((list) => list.every((e) => eventIds.includes(e)), 'Unknown event selected.'),
});

export type WebhookFormInput = z.input<typeof webhookFormSchema>;
export type WebhookFormValues = z.output<typeof webhookFormSchema>;
