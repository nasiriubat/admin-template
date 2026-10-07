import { RUN_STATUSES, WORKFLOW_STATUSES, type RunStatus, type WorkflowStatus } from './types';

export const workflowStatusMeta = Object.fromEntries(WORKFLOW_STATUSES.map((s) => [s.value, s])) as Record<WorkflowStatus, (typeof WORKFLOW_STATUSES)[number]>;
export const runStatusMeta = Object.fromEntries(RUN_STATUSES.map((s) => [s.value, s])) as Record<RunStatus, (typeof RUN_STATUSES)[number]>;

export function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
}

export const formatCost = (usd: number) => (usd === 0 ? '$0.00' : usd < 0.01 ? '<$0.01' : `$${usd.toFixed(2)}`);

export const errorText = (e: unknown) => (e instanceof Error ? e.message : undefined);

export const canRetryRun = (status: RunStatus) => status === 'failed';
export const canCancelRun = (status: RunStatus) => status === 'queued' || status === 'running';
export const canDecideRun = (status: RunStatus) => status === 'awaiting-approval';
