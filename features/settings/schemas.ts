import { z } from '../_shared/zod';
import { LANGUAGES, NOTIFICATION_EVENTS, TIMEZONES } from './types';

export const DOMAIN_PATTERN = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

/** Normalises user input such as " @Example.com " to "example.com". */
export const normalizeDomain = (value: string) => value.trim().replace(/^@/, '').toLowerCase();
export const isValidDomain = (value: string) => DOMAIN_PATTERN.test(normalizeDomain(value));

export const generalSchema = z.object({
  workspaceName: z.string().trim().min(2, 'Enter at least 2 characters.').max(60, 'Keep it under 60 characters.'),
  supportEmail: z.string().trim().toLowerCase().min(1, 'Support email is required.').email('Enter a valid email address.'),
  timezone: z.enum(TIMEZONES, { message: 'Choose a timezone.' }),
  language: z.enum(LANGUAGES.map((l) => l.value) as [string, ...string[]], { message: 'Choose a language.' }),
});

export const securitySchema = z.object({
  requireMfa: z.boolean(),
  sessionTimeoutMinutes: z
    .number({ message: 'Enter a number of minutes.' })
    .int('Use a whole number of minutes.')
    .min(5, 'Use at least 5 minutes.')
    .max(43_200, 'Use at most 43,200 minutes (30 days).'),
  allowedDomains: z
    .array(z.string())
    .max(25, 'Add at most 25 domains.')
    .refine((list) => list.every(isValidDomain), 'One or more domains are not valid.')
    .transform((list) => Array.from(new Set(list.map(normalizeDomain)))),
  passwordMinLength: z
    .number({ message: 'Enter a number of characters.' })
    .int('Use a whole number.')
    .min(8, 'Use at least 8 characters.')
    .max(64, 'Use at most 64 characters.'),
});

const channel = z.object({ email: z.boolean(), inApp: z.boolean() });
export const notificationsSchema = z.object({
  events: z.object(Object.fromEntries(NOTIFICATION_EVENTS.map((e) => [e.id, channel])) as Record<(typeof NOTIFICATION_EVENTS)[number]['id'], typeof channel>),
});

export type GeneralInput = z.input<typeof generalSchema>;
export type GeneralValues = z.output<typeof generalSchema>;
export type SecurityInput = z.input<typeof securitySchema>;
export type SecurityValues = z.output<typeof securitySchema>;
export type NotificationsInput = z.input<typeof notificationsSchema>;
export type NotificationsValues = z.output<typeof notificationsSchema>;
