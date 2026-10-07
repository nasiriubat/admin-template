import { z } from 'zod';

export const contactTopics = [
  { value: 'sales', label: 'Sales and pricing' },
  { value: 'support', label: 'Product support' },
  { value: 'partnership', label: 'Partnerships' },
  { value: 'security', label: 'Security question' },
  { value: 'other', label: 'Something else' },
] as const;

const topicValues = contactTopics.map((t) => t.value) as [string, ...string[]];

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name (at least 2 characters).').max(100, 'Keep your name under 100 characters.'),
  email: z.string().trim().min(1, 'Enter your email address.').pipe(z.email('Enter a valid email address.')),
  company: z.string().trim().max(120, 'Keep the company name under 120 characters.').optional(),
  topic: z.enum(topicValues, { error: 'Choose a topic.' }),
  message: z.string().trim().min(20, 'Tell us a little more (at least 20 characters).').max(2000, 'Keep your message under 2000 characters.'),
  consent: z.boolean().refine((v) => v === true, 'Please agree so we can reply to you.'),
  /** Honeypot: real people never see or fill this field. */
  website: z.string().max(0).optional(),
});

export type ContactValues = z.infer<typeof contactSchema>;

export interface RateLimitOptions {
  key?: string;
  max?: number;
  windowMs?: number;
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * Client-side throttle (a courtesy, not security: the receiving endpoint must enforce its own limits).
 * Returns whether another submission is allowed and, if so, records it.
 */
export function consumeRateLimit(storage: StorageLike | null, now: number, { key = 'nexus:contact:sent', max = 3, windowMs = 10 * 60 * 1000 }: RateLimitOptions = {}): { allowed: boolean; retryAfterMs: number } {
  if (!storage) return { allowed: true, retryAfterMs: 0 };
  let recent: number[] = [];
  try {
    const parsed: unknown = JSON.parse(storage.getItem(key) ?? '[]');
    if (Array.isArray(parsed)) recent = parsed.filter((t): t is number => typeof t === 'number' && now - t < windowMs);
  } catch {
    recent = [];
  }
  if (recent.length >= max) return { allowed: false, retryAfterMs: Math.max(0, windowMs - (now - Math.min(...recent))) };
  try {
    storage.setItem(key, JSON.stringify([...recent, now]));
  } catch {
    /* storage unavailable: allow */
  }
  return { allowed: true, retryAfterMs: 0 };
}

export function buildMailto(to: string, v: Pick<ContactValues, 'name' | 'email' | 'company' | 'topic' | 'message'>): string {
  const topic = contactTopics.find((t) => t.value === v.topic)?.label ?? v.topic;
  const body = `${v.message}\n\n--\n${v.name}${v.company ? `, ${v.company}` : ''}\n${v.email}`;
  return `mailto:${to}?subject=${encodeURIComponent(`[${topic}] Message from ${v.name}`)}&body=${encodeURIComponent(body)}`;
}
