'use client';

import { Badge, Button, formatCompact } from '@nexus/ui';
import { RunTimeline } from './run-details';
import { formatCost, formatDuration, runStatusMeta } from './workflow-utils';
import type { WorkflowRun } from './types';

/** Result of the latest simulated test run, with per-step input, output and logs. */
export function RunPanel({ run, running, onClear }: { run: WorkflowRun | null; running: boolean; onClear: () => void }) {
  if (running) return <p role="status" className="text-sm text-text-muted">Running a simulated test…</p>;
  if (!run) return <p className="text-sm text-text-muted">Use Test run to simulate the workflow. Nothing is sent to models, URLs or recipients; results appear here and on the nodes.</p>;
  const meta = runStatusMeta[run.status];
  return (
    <section aria-label="Test run result" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant={meta.variant} dot>{meta.label}</Badge>
        <span className="text-text-muted">{run.id}</span>
        <span className="tabular-nums text-text-muted">{formatDuration(run.durationMs)} · {formatCompact(run.tokens)} tokens · {formatCost(run.costUsd)}</span>
        <Button size="sm" variant="ghost" className="ml-auto" onClick={onClear}>Clear overlay</Button>
      </div>
      <RunTimeline run={run} />
    </section>
  );
}
