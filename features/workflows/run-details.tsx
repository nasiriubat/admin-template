'use client';

import { Badge, IconRenderer, JsonViewer } from '@nexus/ui';
import { NODE_CATALOG } from './node-catalog';
import { formatDuration, runStatusMeta } from './workflow-utils';
import type { RunStep, StepStatus, WorkflowRun } from './types';

const STEP_TONE: Record<StepStatus, { variant: 'success' | 'danger' | 'neutral' | 'warning'; label: string; icon: string }> = {
  succeeded: { variant: 'success', label: 'Succeeded', icon: 'CheckCircle2' },
  failed: { variant: 'danger', label: 'Failed', icon: 'AlertCircle' },
  skipped: { variant: 'neutral', label: 'Skipped', icon: 'SkipForward' },
  waiting: { variant: 'warning', label: 'Waiting', icon: 'Clock' },
};

function Step({ step, runId }: { step: RunStep; runId: string }) {
  const tone = STEP_TONE[step.status];
  return (
    <li className="rounded-input border border-border bg-surface p-3">
      <div className="flex flex-wrap items-center gap-2">
        <IconRenderer name={NODE_CATALOG[step.kind].icon} className="size-4 text-text-muted" />
        <span className="text-sm font-medium text-text">{step.label}</span>
        <Badge variant={tone.variant}><IconRenderer name={tone.icon} className="size-3" /> {tone.label}</Badge>
        <span className="ml-auto text-xs tabular-nums text-text-muted">
          {formatDuration(step.durationMs)}{step.tokens > 0 ? ` · ${step.tokens.toLocaleString()} tokens` : ''}
        </span>
      </div>
      <p className={step.status === 'failed' ? 'mt-1 text-sm text-danger' : 'mt-1 text-sm text-text-muted'}>{step.log}</p>
      {step.status !== 'skipped' && (
        <details className="mt-2 group">
          <summary className="inline-flex min-h-6 cursor-pointer items-center gap-1 rounded text-xs font-medium text-primary [@media(pointer:coarse)]:min-h-11">
            View input and output
          </summary>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <div className="min-w-0"><p className="mb-1 text-xs font-medium text-text-muted">Input</p><JsonViewer data={step.input} label={`Input of ${step.label} in ${runId}`} /></div>
            <div className="min-w-0"><p className="mb-1 text-xs font-medium text-text-muted">Output</p><JsonViewer data={step.output} label={`Output of ${step.label} in ${runId}`} /></div>
          </div>
        </details>
      )}
    </li>
  );
}

/** Per-step timeline of a run, shared by the runs page and the builder's Run panel. */
export function RunTimeline({ run }: { run: Pick<WorkflowRun, 'id' | 'steps' | 'status' | 'error'> }) {
  if (run.steps.length === 0) {
    return <p className="text-sm text-text-muted">{run.status === 'queued' ? 'This run is queued. Steps appear once it starts.' : 'No steps were recorded for this run.'}</p>;
  }
  return (
    <div className="space-y-2">
      {run.error && <p role="alert" className="text-sm font-medium text-danger">{run.error}</p>}
      <ol aria-label={`Steps of run ${run.id} (${runStatusMeta[run.status].label})`} className="space-y-2">
        {run.steps.map((s) => <Step key={s.nodeId} step={s} runId={run.id} />)}
      </ol>
    </div>
  );
}
