export type ApiKeyStatus = 'active' | 'revoked' | 'expired';

/** What the API returns for a key. The secret is never part of this shape. */
export interface ApiKey {
  id: string;
  name: string;
  /** Non-secret leading characters, e.g. `nxk_live_a1b2`. */
  prefix: string;
  last4: string;
  scopes: string[];
  status: ApiKeyStatus;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
}

/** Returned once by POST /api-keys. `secret` must be shown immediately and then discarded. */
export interface CreatedApiKey {
  key: ApiKey;
  secret: string;
}

export const API_KEY_SCOPES: ReadonlyArray<{ value: string; label: string; description: string }> = [
  { value: 'users:read', label: 'Read users', description: 'List and view user records.' },
  { value: 'users:write', label: 'Write users', description: 'Create, update and delete users.' },
  { value: 'files:read', label: 'Read files', description: 'List and download files.' },
  { value: 'files:write', label: 'Write files', description: 'Upload and delete files.' },
  { value: 'analytics:read', label: 'Read analytics', description: 'Query reports and metrics.' },
  { value: 'webhooks:manage', label: 'Manage webhooks', description: 'Create and delete webhook endpoints.' },
  { value: 'jobs:read', label: 'Read jobs', description: 'Inspect background job status.' },
];

export const EXPIRY_PRESETS = [
  { value: '30', label: '30 days', days: 30 },
  { value: '90', label: '90 days', days: 90 },
  { value: '365', label: '1 year', days: 365 },
  { value: 'never', label: 'No expiry', days: null },
] as const;

export type ExpiryPreset = (typeof EXPIRY_PRESETS)[number]['value'];

export const API_KEY_STATUSES: ReadonlyArray<{ value: ApiKeyStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'revoked', label: 'Revoked' },
  { value: 'expired', label: 'Expired' },
];
