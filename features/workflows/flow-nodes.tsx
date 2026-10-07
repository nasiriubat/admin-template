'use client';

import { Handle, Position, type NodeProps, type NodeTypes } from '@xyflow/react';
import { Badge, cn, IconRenderer } from '@nexus/ui';
import type { FlowNode, RunOverlay } from './editor-state';
import { NODE_CATALOG, nodeSummary } from './node-catalog';
import { formatDuration } from './workflow-utils';

const handleClass = '!size-5 !border-2 !border-surface !bg-primary after:absolute after:-inset-[2px] after:content-[""]';

const RUN_BADGE: Record<RunOverlay['status'], { variant: 'success' | 'danger' | 'neutral' | 'warning'; label: string }> = {
  succeeded: { variant: 'success', label: 'Succeeded' },
  failed: { variant: 'danger', label: 'Failed' },
  skipped: { variant: 'neutral', label: 'Skipped' },
  waiting: { variant: 'warning', label: 'Waiting' },
};

/** One component renders every node kind: icon chip, title, summary, run status and the right handles. */
export function WorkflowNodeView({ data, selected }: NodeProps<FlowNode>) {
  const spec = NODE_CATALOG[data.kind];
  const run = data.run ? RUN_BADGE[data.run.status] : null;
  return (
    <div
      className={cn(
        'w-[220px] rounded-card border bg-surface-elevated p-3 text-left shadow-card transition-shadow motion-reduce:transition-none',
        selected ? 'border-primary ring-2 ring-primary/40' : data.issue === 'error' ? 'border-danger' : data.issue === 'warning' ? 'border-warning' : 'border-border-strong',
      )}
    >
      {spec.hasInput && <Handle type="target" position={Position.Left} className={handleClass} aria-hidden="true" />}
      <div className="flex items-start gap-2.5">
        <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', spec.tone)}><IconRenderer name={spec.icon} className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text">{data.label}</p>
          <p className="truncate text-xs text-text-muted">{nodeSummary({ type: data.kind, config: data.config })}</p>
        </div>
      </div>
      {(run || data.issue) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {run && data.run && <Badge variant={run.variant}>{run.label} · {formatDuration(data.run.durationMs)}</Badge>}
          {data.issue && !run && (
            <Badge variant={data.issue === 'error' ? 'danger' : 'warning'}>
              <IconRenderer name={data.issue === 'error' ? 'AlertCircle' : 'AlertTriangle'} className="size-3" /> {data.issue === 'error' ? 'Needs attention' : 'Check connections'}
            </Badge>
          )}
        </div>
      )}
      {data.kind === 'condition' ? (
        <>
          <Handle id="true" type="source" position={Position.Right} style={{ top: '32%' }} className={handleClass} aria-hidden="true" />
          <Handle id="false" type="source" position={Position.Right} style={{ top: '72%' }} className={handleClass} aria-hidden="true" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-9 top-[32%] -translate-y-1/2 text-[11px] font-medium text-text-muted">true</span>
          <span aria-hidden="true" className="pointer-events-none absolute -right-10 top-[72%] -translate-y-1/2 text-[11px] font-medium text-text-muted">false</span>
        </>
      ) : (
        spec.hasOutput && <Handle type="source" position={Position.Right} className={handleClass} aria-hidden="true" />
      )}
    </div>
  );
}

export const nodeTypes: NodeTypes = { wf: WorkflowNodeView };
