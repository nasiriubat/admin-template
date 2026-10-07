export type ProviderType = 'openai-compatible' | 'anthropic' | 'local';
export type ProviderStatus = 'connected' | 'error' | 'disabled';
export type TaskType = 'chat' | 'embedding';
export type ModelCapability = 'chat' | 'embedding' | 'vision' | 'tools' | 'json';
export type UsageRange = '7d' | '30d' | '90d';

export const PROVIDER_TYPES: ReadonlyArray<{ value: ProviderType; label: string }> = [
  { value: 'openai-compatible', label: 'OpenAI-compatible' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'local', label: 'Local runtime' },
];
export const TASK_TYPES: ReadonlyArray<{ value: TaskType; label: string }> = [
  { value: 'chat', label: 'Chat' },
  { value: 'embedding', label: 'Embedding' },
];
export const USAGE_RANGES: ReadonlyArray<{ value: UsageRange; label: string }> = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

/** Providers never carry their API key: only the prefix and last four characters come back. */
export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  baseUrl: string;
  status: ProviderStatus;
  keyPrefix: string | null;
  keyLast4: string | null;
  createdAt: string;
  lastCheckedAt: string | null;
}

export interface ConnectionTestResult {
  ok: boolean;
  latencyMs: number;
  message: string;
}

export interface AiModel {
  id: string;
  providerId: string;
  providerName: string;
  modelId: string;
  displayName: string;
  contextWindow: number;
  /** USD per 1M tokens. */
  inputPrice: number;
  outputPrice: number;
  capabilities: ModelCapability[];
  enabled: boolean;
  defaultFor: TaskType[];
}

export interface PromptVersion {
  version: number;
  template: string;
  note: string;
  author: string;
  createdAt: string;
}

export interface Prompt {
  id: string;
  name: string;
  description: string;
  tags: string[];
  template: string;
  currentVersion: number;
  versions: PromptVersion[];
  updatedAt: string;
}

export interface UsageConsumer {
  id: string;
  name: string;
  kind: 'user' | 'prompt';
  requests: number;
  tokens: number;
  cost: number;
}

export interface UsageReport {
  range: UsageRange;
  metrics: { requests: number; tokensIn: number; tokensOut: number; cost: number; errorRate: number };
  models: string[];
  /** One row per day: `date` plus a token count keyed by model name. */
  daily: Array<Record<string, number | string>>;
  costByProvider: Array<{ name: string; value: number }>;
  consumers: UsageConsumer[];
}
