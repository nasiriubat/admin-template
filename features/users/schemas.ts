import { z } from 'zod';
import { ROLE_OPTIONS } from '../_shared/roles';

const roleIds = ROLE_OPTIONS.map((r) => r.value) as [string, ...string[]];

export const userFormSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters.').max(80, 'Keep it under 80 characters.'),
  email: z.string().trim().toLowerCase().min(1, 'Email is required.').email('Enter a valid email address.'),
  role: z.enum(roleIds, { message: 'Choose a role.' }),
  status: z.enum(['active', 'invited', 'suspended']),
});

export type UserFormInput = z.input<typeof userFormSchema>;
export type UserFormValues = z.output<typeof userFormSchema>;
