export type WebhookStatus = 'enabled' | 'disabled' | 'failing';

export interface Webhook {
  id: string;
  url: string;
  description: string;
  events: string[];
  /** The switch the user controls. */
  enabled: boolean;
  /** Derived by the server: disabled, failing (recent deliveries mostly erroring) or enabled. */
  status: WebhookStatus;
  lastDeliveryAt: string | null;
  /** 0-100, over the last 100 deliveries. */
  successRate: number;
  /** Signing secret metadata only. The secret itself is never returned after creation. */
  secretPrefix: string;
  secretLast4: string;
  createdAt: string;
}

/** Returned once by create and rotate. `secret` must be shown immediately and then discarded. */
export interface WebhookWithSecret {
  webhook: Webhook;
  secret: string;
}

export interface WebhookDelivery {
  id: string;
  event: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
  /** 1 for the first attempt; higher numbers are retries. */
  attempt: number;
  success: boolean;
}

export interface TestEventResult {
  success: boolean;
  statusCode: number;
  durationMs: number;
}

export const WEBHOOK_EVENTS: ReadonlyArray<{ value: string; description: string }> = [
  { value: 'user.created', description: 'A user account was created.' },
  { value: 'user.updated', description: 'A user’s profile or role changed.' },
  { value: 'user.deleted', description: 'A user account was deleted.' },
  { value: 'key.created', description: 'An API key was created.' },
  { value: 'key.revoked', description: 'An API key was revoked.' },
  { value: 'job.completed', description: 'A background job finished successfully.' },
  { value: 'job.failed', description: 'A background job failed.' },
  { value: 'file.uploaded', description: 'A file was uploaded.' },
];

export const WEBHOOK_STATUSES: ReadonlyArray<{ value: WebhookStatus; label: string }> = [
  { value: 'enabled', label: 'Enabled' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'failing', label: 'Failing' },
];
