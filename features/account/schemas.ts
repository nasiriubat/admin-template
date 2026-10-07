import { z } from '../_shared/zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
  remember: z.boolean().optional(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email.').email('Enter a valid email address.'),
});

/** Shared password policy: length first (NIST 800-63B), plus a basic strength floor. */
export const passwordSchema = z
  .string()
  .min(10, 'Use at least 10 characters.')
  .max(128, 'Use at most 128 characters.')
  .refine((v) => /[a-z]/.test(v) && /[A-Z0-9\W_]/.test(v), 'Mix lowercase letters with an uppercase letter, number or symbol.');

export const resetPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string().min(1, 'Confirm your new password.') })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match.' });

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, 'Enter your current password.'),
    password: passwordSchema,
    confirm: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match.' })
  .refine((v) => v.password !== v.current, { path: ['password'], message: 'Choose a password you haven’t used here before.' });

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters.').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  timezone: z.string().min(1),
});
