export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface JobError {
  message: string;
  stack?: string[];
}

export interface Job {
  id: string;
  name: string;
  queue: string;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  durationMs: number | null;
  createdAt: string;
  error: JobError | null;
}

export interface QueueStats {
  name: string;
  queued: number;
  running: number;
  failed: number;
  succeeded: number;
}

export interface JobStats {
  queued: number;
  running: number;
  failed: number;
  completed24h: number;
  queues: QueueStats[];
}

export const JOB_STATUSES: ReadonlyArray<{ value: JobStatus; label: string; variant: 'info' | 'primary' | 'success' | 'danger' | 'neutral' }> = [
  { value: 'queued', label: 'Queued', variant: 'info' },
  { value: 'running', label: 'Running', variant: 'primary' },
  { value: 'succeeded', label: 'Succeeded', variant: 'success' },
  { value: 'failed', label: 'Failed', variant: 'danger' },
  { value: 'cancelled', label: 'Cancelled', variant: 'neutral' },
];

export const QUEUES = ['default', 'emails', 'webhooks', 'reports', 'imports'] as const;

export const REFRESH_INTERVAL_MS = 15_000;
