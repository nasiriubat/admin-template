export interface Profile {
  name: string;
  email: string;
  timezone: string;
}

export interface AccountSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActiveAt: string;
  createdAt: string;
  current: boolean;
}

export interface LoginEvent {
  id: string;
  at: string;
  success: boolean;
  /** Why a sign-in failed; null for successes. */
  reason: string | null;
  ip: string;
  location: string;
  browser: string;
  os: string;
}

export const PROFILE_TIMEZONES = [
  'UTC',
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Helsinki',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Australia/Sydney',
] as const;

export type DeviceKind = 'desktop' | 'mobile';
export const deviceIcon = (device: string) => (/iphone|android|pixel|ipad/i.test(device) ? 'Smartphone' : 'Monitor');
