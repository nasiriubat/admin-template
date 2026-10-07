export type WorkflowStatus = 'draft' | 'active' | 'paused';
export type TriggerType = 'manual' | 'schedule' | 'webhook' | 'event';
export type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'awaiting-approval';
export type StepStatus = 'succeeded' | 'failed' | 'skipped' | 'waiting';
export type Concurrency = 'skip' | 'queue' | 'allow';
export type Backoff = 'none' | 'linear' | 'exponential';

export const NODE_KINDS = ['trigger', 'llm', 'retrieval', 'http', 'transform', 'condition', 'loop', 'approval', 'notify', 'output'] as const;
export type NodeKind = (typeof NODE_KINDS)[number];

type BadgeVariant = 'info' | 'primary' | 'success' | 'danger' | 'neutral' | 'warning';

export const WORKFLOW_STATUSES: ReadonlyArray<{ value: WorkflowStatus; label: string; variant: BadgeVariant }> = [
  { value: 'draft', label: 'Draft', variant: 'neutral' },
  { value: 'active', label: 'Active', variant: 'success' },
  { value: 'paused', label: 'Paused', variant: 'warning' },
];

export const TRIGGER_TYPES: ReadonlyArray<{ value: TriggerType; label: string; icon: string }> = [
  { value: 'manual', label: 'Manual', icon: 'Hand' },
  { value: 'schedule', label: 'Schedule', icon: 'CalendarClock' },
  { value: 'webhook', label: 'Webhook', icon: 'Webhook' },
  { value: 'event', label: 'Event', icon: 'Zap' },
];

export const RUN_STATUSES: ReadonlyArray<{ value: RunStatus; label: string; variant: BadgeVariant }> = [
  { value: 'queued', label: 'Queued', variant: 'info' },
  { value: 'running', label: 'Running', variant: 'primary' },
  { value: 'succeeded', label: 'Succeeded', variant: 'success' },
  { value: 'failed', label: 'Failed', variant: 'danger' },
  { value: 'cancelled', label: 'Cancelled', variant: 'neutral' },
  { value: 'awaiting-approval', label: 'Awaiting approval', variant: 'warning' },
];

export const EVENT_CATALOGUE: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'ticket.created', label: 'Support ticket created' },
  { value: 'user.created', label: 'User signed up' },
  { value: 'invoice.paid', label: 'Invoice paid' },
  { value: 'document.uploaded', label: 'Knowledge document uploaded' },
  { value: 'api-key.rotated', label: 'API key rotated' },
  { value: 'job.failed', label: 'Background job failed' },
];

export const KNOWLEDGE_SOURCES = ['Product documentation', 'Engineering handbook', 'Support playbooks', 'Company wiki'] as const;

export interface Position {
  x: number;
  y: number;
}

/** A node in the stored/exported graph. `config` is validated per kind by `configSchemas`. */
export interface WorkflowNode {
  id: string;
  type: NodeKind;
  label: string;
  position: Position;
  config: Record<string, unknown>;
}

/** `sourceHandle` is `true`/`false` for condition nodes and null otherwise. */
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string | null;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ScheduleConfig {
  cron: string;
  timezone: string;
  concurrency: Concurrency;
  retryAttempts: number;
  backoff: Backoff;
  paused: boolean;
  catchUp: boolean;
}

export const DEFAULT_SCHEDULE: ScheduleConfig = {
  cron: '0 9 * * 1-5',
  timezone: 'UTC',
  concurrency: 'skip',
  retryAttempts: 2,
  backoff: 'exponential',
  paused: false,
  catchUp: false,
};

export interface WorkflowVersion {
  version: number;
  savedAt: string;
  author: string;
  note: string;
  nodeCount: number;
  graph: WorkflowGraph;
}

export interface WebhookInfo {
  url: string;
  secretLast4: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  trigger: TriggerType;
  schedule: ScheduleConfig;
  webhook: WebhookInfo | null;
  graph: WorkflowGraph;
  version: number;
  versions: WorkflowVersion[];
  owner: string;
  nextRunAt: string | null;
  lastRunStatus: RunStatus | null;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** What list endpoints return: no graph or version payloads. */
export type WorkflowSummary = Omit<Workflow, 'graph' | 'versions'> & { nodeCount: number };

export interface RunStep {
  nodeId: string;
  label: string;
  kind: NodeKind;
  status: StepStatus;
  durationMs: number;
  tokens: number;
  input: unknown;
  output: unknown;
  log: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  trigger: TriggerType;
  status: RunStatus;
  startedAt: string;
  durationMs: number | null;
  tokens: number;
  costUsd: number;
  error: string | null;
  steps: RunStep[];
}

export interface RunStats {
  runs24h: number;
  successRate: number;
  avgDurationMs: number;
  tokens24h: number;
}

export type TemplateId = 'blank' | 'rag-qa' | 'support-triage' | 'daily-digest';

export const REFRESH_INTERVAL_MS = 10_000;

/** Placeholder returned in place of stored secret values (HTTP header values). Sending it back keeps the stored value. */
export const SECRET_MASK = '••••••••';
