export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type TimeRange = '15m' | '1h' | '24h' | '7d';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  requestId: string;
  context: Record<string, unknown>;
}

export const LOG_LEVELS: ReadonlyArray<{ value: LogLevel; label: string; variant: 'neutral' | 'info' | 'warning' | 'danger' }> = [
  { value: 'debug', label: 'Debug', variant: 'neutral' },
  { value: 'info', label: 'Info', variant: 'info' },
  { value: 'warn', label: 'Warn', variant: 'warning' },
  { value: 'error', label: 'Error', variant: 'danger' },
];

export const LOG_SERVICES = ['api', 'auth', 'worker', 'billing', 'search', 'mailer', 'scheduler'] as const;

export const TIME_RANGES: ReadonlyArray<{ value: TimeRange; label: string; minutes: number }> = [
  { value: '15m', label: 'Last 15 minutes', minutes: 15 },
  { value: '1h', label: 'Last hour', minutes: 60 },
  { value: '24h', label: 'Last 24 hours', minutes: 1440 },
  { value: '7d', label: 'Last 7 days', minutes: 10080 },
];

export const LIVE_TAIL_INTERVAL_MS = 5_000;
