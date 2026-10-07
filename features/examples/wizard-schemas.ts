import { z } from '../_shared/zod';

/** One schema per step: each step validates on its own, and the review step shows the merged result. */
export const accountStepSchema = z.object({
  workspaceName: z.string().trim().min(3, 'Enter at least 3 characters.').max(40, 'Keep it under 40 characters.'),
  adminEmail: z.string().trim().toLowerCase().min(1, 'Email is required.').email('Enter a valid email address.'),
});

export const REGIONS = [
  { value: 'eu-north', label: 'Europe (Stockholm)' },
  { value: 'us-east', label: 'US East (Virginia)' },
  { value: 'ap-south', label: 'Asia Pacific (Mumbai)' },
] as const;

export const preferencesStepSchema = z.object({
  region: z.enum(['eu-north', 'us-east', 'ap-south'], { message: 'Choose a region.' }),
  weeklyDigest: z.boolean(),
  invitees: z.array(z.string().email()).max(5, 'Invite at most 5 people for now.'),
});

export type AccountStepValues = z.output<typeof accountStepSchema>;
export type PreferencesStepValues = z.output<typeof preferencesStepSchema>;
export type WizardData = AccountStepValues & PreferencesStepValues;

export const EMPTY_ACCOUNT: AccountStepValues = { workspaceName: '', adminEmail: '' };
export const EMPTY_PREFERENCES: PreferencesStepValues = { region: 'eu-north', weeklyDigest: true, invitees: [] };

export const WIZARD_STEPS = [
  { id: 'account', label: 'Account', description: 'Name and owner' },
  { id: 'preferences', label: 'Preferences', description: 'Region and team' },
  { id: 'review', label: 'Review', description: 'Confirm and create' },
] as const;
