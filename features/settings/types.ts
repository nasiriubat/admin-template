export interface GeneralSettings {
  workspaceName: string;
  supportEmail: string;
  timezone: string;
  language: string;
}

export interface SecuritySettings {
  requireMfa: boolean;
  sessionTimeoutMinutes: number;
  allowedDomains: string[];
  passwordMinLength: number;
}

export interface ChannelPreference {
  email: boolean;
  inApp: boolean;
}

export const NOTIFICATION_EVENTS = [
  { id: 'userInvited', label: 'New user invited', description: 'Someone is invited to the workspace.' },
  { id: 'securityAlert', label: 'Security alerts', description: 'Failed sign-ins, new devices and permission changes.' },
  { id: 'jobFailed', label: 'Background job failures', description: 'A scheduled or queued job exits with an error.' },
  { id: 'webhookFailing', label: 'Webhook delivery problems', description: 'An endpoint keeps returning errors.' },
  { id: 'weeklyDigest', label: 'Weekly digest', description: 'A summary of activity every Monday.' },
] as const;

export type NotificationEventId = (typeof NOTIFICATION_EVENTS)[number]['id'];

export interface NotificationSettings {
  events: Record<NotificationEventId, ChannelPreference>;
}

export interface WorkspaceSettings {
  general: GeneralSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
}

export type SettingsCategory = keyof WorkspaceSettings;

export const TIMEZONES = [
  'UTC',
  'America/Los_Angeles',
  'America/New_York',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Helsinki',
  'Africa/Lagos',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
] as const;

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fi', label: 'Suomi' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
] as const;

export const DEFAULT_SETTINGS: WorkspaceSettings = {
  general: { workspaceName: 'Nexus Workspace', supportEmail: 'support@example.com', timezone: 'UTC', language: 'en' },
  security: { requireMfa: false, sessionTimeoutMinutes: 480, allowedDomains: [], passwordMinLength: 10 },
  notifications: {
    events: {
      userInvited: { email: true, inApp: true },
      securityAlert: { email: true, inApp: true },
      jobFailed: { email: false, inApp: true },
      webhookFailing: { email: true, inApp: true },
      weeklyDigest: { email: true, inApp: false },
    },
  },
};
