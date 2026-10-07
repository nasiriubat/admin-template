'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useCan } from '@nexus/auth';
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  FilterBar,
  formatRelative,
  IconRenderer,
  PageContainer,
  PageHeader,
  Select,
  toast,
  useDebouncedValue,
  useTableQuery,
} from '@nexus/ui';
import { useCancelJob, useJobs, useJobStats, useRetryJob, useRetryJobs } from './hooks';
import { canCancel, canRetry, formatDuration, retryableIds } from './jobs-utils';
import { QueueOverview } from './queue-overview';
import { JOB_STATUSES, QUEUES, type Job } from './types';

const col = createColumnHelper<Job>();
const statusMeta = Object.fromEntries(JOB_STATUSES.map((s) => [s.value, s])) as Record<string, (typeof JOB_STATUSES)[number]>;
const errorText = (e: unknown) => (e instanceof Error ? e.message : undefined);

function JobDetails({ job }: { job: Job }) {
  if (job.status === 'failed' && job.error) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-danger">{job.error.message}</p>
        {job.error.stack && (
          <pre tabIndex={0} aria-label={`Stack trace for ${job.id}`} className="custom-scrollbar max-h-48 overflow-auto rounded-input border border-border bg-surface p-3 font-mono text-xs text-text">
            {job.error.stack.join('\n')}
          </pre>
        )}
        <p className="text-xs text-text-muted">Failed after {job.attempts} of {job.maxAttempts} attempts.</p>
      </div>
    );
  }
  return (
    <p className="text-sm text-text-muted">
      {job.name} on <span className="font-mono">{job.queue}</span> · {job.attempts} of {job.maxAttempts} attempts used · created {formatRelative(job.createdAt)}.
    </p>
  );
}

export function JobsPage() {
  const canManage = useCan('jobs.manage');
  const { query, setQuery } = useTableQuery({ sort: 'createdAt', direction: 'desc' });
  const [status, setStatus] = useState('');
  const [queue, setQueue] = useState('');
  const search = useDebouncedValue(query.search);

  const stats = useJobStats();
  const list = useJobs({ page: query.page, pageSize: query.pageSize, sort: query.sort, direction: query.direction, search, filters: { status, queue } });
  const retry = useRetryJob();
  const cancel = useCancelJob();
  const retryMany = useRetryJobs();
  const [cancelling, setCancelling] = useState<Job | null>(null);

  const activeFilters = Number(Boolean(status)) + Number(Boolean(queue));
  const clearFilters = () => {
    setStatus('');
    setQueue('');
    setQuery({ page: 1 });
  };

  async function retryOne(job: Job) {
    try {
      await retry.mutateAsync(job.id);
      toast.success('Job queued for retry', { description: job.id });
    } catch (e) {
      toast.error('Could not retry job', { description: errorText(e) });
    }
  }

  const columns = useMemo(
    () => [
      col.accessor('id', { header: 'Job', meta: { label: 'Job ID', mobile: 'primary', alwaysVisible: true }, cell: (c) => <span className="font-mono text-xs">{c.getValue()}</span> }),
      col.accessor('name', { header: 'Name', cell: (c) => <span className="font-medium">{c.getValue()}</span> }),
      col.accessor('queue', { header: 'Queue', cell: (c) => <span className="font-mono text-xs">{c.getValue()}</span> }),
      col.accessor('status', {
        header: 'Status',
        cell: (c) => (
          <Badge variant={statusMeta[c.getValue()]?.variant} dot>
            {statusMeta[c.getValue()]?.label ?? c.getValue()}
          </Badge>
        ),
      }),
      col.accessor('attempts', { header: 'Attempts', cell: (c) => <span className="tabular-nums">{c.getValue()}/{c.row.original.maxAttempts}</span> }),
      col.accessor('durationMs', { header: 'Duration', cell: (c) => <span className="tabular-nums">{formatDuration(c.getValue())}</span>, meta: { exportValue: (j: Job) => j.durationMs ?? '' } }),
      col.accessor('createdAt', { header: 'Created', cell: (c) => formatRelative(c.getValue()), meta: { exportValue: (j: Job) => j.createdAt } }),
    ],
    [],
  );

  return (
    <PageContainer>
      <PageHeader title="Jobs & Queues" description="Monitor background work, retry failures and cancel jobs that are no longer needed." />

      <QueueOverview stats={stats.data} isPending={stats.isPending} error={stats.error} onRetry={() => void stats.refetch()} />

      <DataTable<Job>
        caption="Background jobs"
        columns={columns}
        data={list.data?.items ?? []}
        total={list.data?.meta.total}
        getRowId={(j) => j.id}
        getRowLabel={(j) => `${j.name} ${j.id}`}
        mode="server"
        query={query}
        onQueryChange={setQuery}
        isLoading={list.isPending}
        isFetching={list.isFetching && !list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        searchPlaceholder="Search by job ID, name or queue"
        selectable={canManage}
        exportFileName="jobs"
        renderExpanded={(job) => <JobDetails job={job} />}
        hasActiveFilters={activeFilters > 0}
        onClearFilters={clearFilters}
        emptyTitle="No jobs yet"
        emptyDescription="Jobs appear here as your application schedules background work."
        filters={
          <FilterBar activeCount={activeFilters} onClear={clearFilters}>
            <Select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setQuery({ page: 1 }); }} className="md:w-40">
              <option value="">All statuses</option>
              {JOB_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
            <Select aria-label="Filter by queue" value={queue} onChange={(e) => { setQueue(e.target.value); setQuery({ page: 1 }); }} className="md:w-40">
              <option value="">All queues</option>
              {QUEUES.map((q) => <option key={q} value={q}>{q}</option>)}
            </Select>
          </FilterBar>
        }
        bulkActions={(rows, clear) => {
          const ids = retryableIds(rows);
          return (
            <Button
              size="sm"
              variant="secondary"
              disabled={ids.length === 0}
              loading={retryMany.isPending}
              onClick={async () => {
                try {
                  await retryMany.mutateAsync({ ids });
                  toast.success(`${ids.length} failed job${ids.length > 1 ? 's' : ''} queued for retry`);
                  clear();
                } catch (e) {
                  toast.error('Could not retry jobs', { description: errorText(e) });
                }
              }}
            >
              <IconRenderer name="RotateCcw" className="size-4" /> Retry {ids.length} failed
            </Button>
          );
        }}
        rowActions={(job) =>
          canManage && (canRetry(job) || canCancel(job)) ? (
            <div className="flex items-center justify-end gap-1">
              {canRetry(job) && (
                <Button variant="ghost" size="sm" aria-label={`Retry job ${job.id}`} onClick={() => void retryOne(job)}>
                  <IconRenderer name="RotateCcw" className="size-4" /> Retry
                </Button>
              )}
              {canCancel(job) && (
                <Button variant="danger-ghost" size="sm" aria-label={`Cancel job ${job.id}`} onClick={() => setCancelling(job)}>
                  <IconRenderer name="Ban" className="size-4" /> Cancel
                </Button>
              )}
            </div>
          ) : null
        }
      />

      <ConfirmDialog
        open={Boolean(cancelling)}
        onOpenChange={(open) => !open && setCancelling(null)}
        title={`Cancel ${cancelling?.name ?? 'job'}?`}
        description={`Job ${cancelling?.id ?? ''} will stop and won't be retried automatically. Work already completed is not rolled back.`}
        confirmLabel="Cancel job"
        cancelLabel="Keep job"
        onConfirm={async () => {
          if (!cancelling) return;
          await cancel.mutateAsync(cancelling.id);
          toast.success('Job cancelled', { description: cancelling.id });
        }}
      />
    </PageContainer>
  );
}
