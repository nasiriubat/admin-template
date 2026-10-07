'use client';

import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCan } from '@nexus/auth';
import {
  Badge, Button, ConfirmDialog, DataTable, ErrorState, FilterBar, formatCompact, formatRelative, IconRenderer, Label, MetricCard, PageContainer, PageHeader, Select, Switch, toast, useDebouncedValue, useTableQuery,
} from '@nexus/ui';
import { useApproveRun, useCancelRun, useRejectRun, useRetryRun, useRunStats, useWorkflowRuns } from './hooks';
import { RunTimeline } from './run-details';
import { canCancelRun, canDecideRun, canRetryRun, errorText, formatCost, formatDuration, runStatusMeta } from './workflow-utils';
import { RUN_STATUSES, TRIGGER_TYPES, type WorkflowRun } from './types';

const col = createColumnHelper<WorkflowRun>();

export function WorkflowRunsPage() {
  const canManage = useCan('workflows.manage');
  const { query, setQuery } = useTableQuery({ sort: 'startedAt', direction: 'desc' });
  const [status, setStatus] = useState('');
  const [trigger, setTrigger] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const search = useDebouncedValue(query.search);

  const stats = useRunStats(autoRefresh);
  const list = useWorkflowRuns({ page: query.page, pageSize: query.pageSize, sort: query.sort, direction: query.direction, search, filters: { status, trigger } }, autoRefresh);
  const retry = useRetryRun();
  const cancel = useCancelRun();
  const approve = useApproveRun();
  const reject = useRejectRun();
  const [cancelling, setCancelling] = useState<WorkflowRun | null>(null);
  const [rejecting, setRejecting] = useState<WorkflowRun | null>(null);

  const activeFilters = Number(Boolean(status)) + Number(Boolean(trigger));
  const clearFilters = () => {
    setStatus('');
    setTrigger('');
    setQuery({ page: 1 });
  };

  async function act(label: string, run: WorkflowRun, fn: () => Promise<unknown>) {
    try {
      await fn();
      toast.success(label, { description: run.id });
    } catch (e) {
      toast.error('Could not complete the action', { description: errorText(e) });
    }
  }

  const columns = useMemo(
    () => [
      col.accessor('id', { header: 'Run', meta: { label: 'Run ID', mobile: 'primary', alwaysVisible: true }, cell: (c) => <span className="font-mono text-xs">{c.getValue()}</span> }),
      col.accessor('workflowName', { header: 'Workflow', cell: (c) => <Link href={`/workflows/${c.row.original.workflowId}`} className="rounded font-medium hover:text-primary">{c.getValue()}</Link> }),
      col.accessor('trigger', { header: 'Trigger', cell: (c) => <span className="capitalize">{c.getValue()}</span> }),
      col.accessor('status', { header: 'Status', cell: (c) => <Badge variant={runStatusMeta[c.getValue()].variant} dot>{runStatusMeta[c.getValue()].label}</Badge> }),
      col.accessor('startedAt', { header: 'Started', cell: (c) => formatRelative(c.getValue()), meta: { exportValue: (r: WorkflowRun) => r.startedAt } }),
      col.accessor('durationMs', { header: 'Duration', cell: (c) => <span className="tabular-nums">{formatDuration(c.getValue())}</span>, meta: { exportValue: (r: WorkflowRun) => r.durationMs ?? '' } }),
      col.accessor('tokens', { header: 'Tokens', cell: (c) => <span className="tabular-nums">{c.getValue().toLocaleString()}</span> }),
      col.accessor('costUsd', { header: 'Cost', cell: (c) => <span className="tabular-nums">{formatCost(c.getValue())}</span> }),
    ],
    [],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Workflow Runs"
        description="Every execution across all workflows, with step-by-step inputs and outputs."
        actions={<Button variant="secondary" asChild><Link href="/workflows"><IconRenderer name="Workflow" className="size-4" /> Workflows</Link></Button>}
      />

      {stats.isError ? (
        <ErrorState error={stats.error} onRetry={() => void stats.refetch()} />
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Run metrics for the last 24 hours" role="group">
          <MetricCard label="Runs (24h)" icon="Play" loading={stats.isPending} value={stats.data?.runs24h.toLocaleString() ?? ''} />
          <MetricCard label="Success rate" icon="CheckCircle2" loading={stats.isPending} value={stats.data ? `${Math.round(stats.data.successRate * 100)}%` : ''} />
          <MetricCard label="Avg duration" icon="Timer" loading={stats.isPending} value={stats.data ? formatDuration(stats.data.avgDurationMs) : ''} />
          <MetricCard label="Tokens (24h)" icon="Brain" loading={stats.isPending} value={stats.data ? formatCompact(stats.data.tokens24h) : ''} />
        </div>
      )}

      <DataTable<WorkflowRun>
        caption="Workflow runs"
        columns={columns}
        data={list.data?.items ?? []}
        total={list.data?.meta.total}
        getRowId={(r) => r.id}
        getRowLabel={(r) => `${r.workflowName} ${r.id}`}
        mode="server"
        query={query}
        onQueryChange={setQuery}
        isLoading={list.isPending}
        isFetching={list.isFetching && !list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        searchPlaceholder="Search by run ID or workflow"
        exportFileName="workflow-runs"
        renderExpanded={(run) => <RunTimeline run={run} />}
        hasActiveFilters={activeFilters > 0}
        onClearFilters={clearFilters}
        emptyTitle="No runs yet"
        emptyDescription="Runs appear here when a workflow is triggered or tested."
        toolbarActions={
          <div className="flex items-center gap-2">
            <Switch id="runs-auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <Label htmlFor="runs-auto-refresh">Auto-refresh</Label>
          </div>
        }
        filters={
          <FilterBar activeCount={activeFilters} onClear={clearFilters}>
            <Select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setQuery({ page: 1 }); }} className="md:w-48">
              <option value="">All statuses</option>
              {RUN_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
            <Select aria-label="Filter by trigger" value={trigger} onChange={(e) => { setTrigger(e.target.value); setQuery({ page: 1 }); }} className="md:w-40">
              <option value="">All triggers</option>
              {TRIGGER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </FilterBar>
        }
        rowActions={(run) =>
          canManage && (canRetryRun(run.status) || canCancelRun(run.status) || canDecideRun(run.status)) ? (
            <div className="flex items-center justify-end gap-1">
              {canRetryRun(run.status) && <Button variant="ghost" size="sm" aria-label={`Retry run ${run.id}`} onClick={() => void act('Run queued for retry', run, () => retry.mutateAsync(run.id))}><IconRenderer name="RotateCcw" className="size-4" /> Retry</Button>}
              {canCancelRun(run.status) && <Button variant="danger-ghost" size="sm" aria-label={`Cancel run ${run.id}`} onClick={() => setCancelling(run)}><IconRenderer name="Ban" className="size-4" /> Cancel</Button>}
              {canDecideRun(run.status) && (
                <>
                  <Button variant="ghost" size="sm" aria-label={`Approve run ${run.id}`} onClick={() => void act('Run approved', run, () => approve.mutateAsync(run.id))}><IconRenderer name="Check" className="size-4" /> Approve</Button>
                  <Button variant="danger-ghost" size="sm" aria-label={`Reject run ${run.id}`} onClick={() => setRejecting(run)}><IconRenderer name="X" className="size-4" /> Reject</Button>
                </>
              )}
            </div>
          ) : null
        }
      />

      <ConfirmDialog
        open={Boolean(cancelling)}
        onOpenChange={(open) => !open && setCancelling(null)}
        title={`Cancel run ${cancelling?.id ?? ''}?`}
        description="The run stops at its current step. Work already completed is not rolled back."
        confirmLabel="Cancel run"
        cancelLabel="Keep running"
        onConfirm={async () => {
          if (!cancelling) return;
          await cancel.mutateAsync(cancelling.id);
          toast.success('Run cancelled', { description: cancelling.id });
        }}
      />
      <ConfirmDialog
        open={Boolean(rejecting)}
        onOpenChange={(open) => !open && setRejecting(null)}
        title={`Reject run ${rejecting?.id ?? ''}?`}
        description="Rejecting ends the run. Nothing after the approval step will execute."
        confirmLabel="Reject run"
        cancelLabel="Keep waiting"
        onConfirm={async () => {
          if (!rejecting) return;
          await reject.mutateAsync(rejecting.id);
          toast.success('Run rejected', { description: rejecting.id });
        }}
      />
    </PageContainer>
  );
}
