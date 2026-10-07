'use client';

import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCan } from '@nexus/auth';
import {
  Badge, Button, ConfirmDialog, DataTable, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
  FilterBar, formatRelative, IconRenderer, PageContainer, PageHeader, Select, toast, useDebouncedValue, useTableQuery,
} from '@nexus/ui';
import { describeCron } from './cron';
import { useDeleteWorkflow, useDuplicateWorkflow, useRunWorkflow, useSetWorkflowStatus, useWorkflows } from './hooks';
import { WorkflowFormDialog } from './workflow-form-dialog';
import { WorkflowTemplates } from './workflow-templates';
import { errorText, runStatusMeta, workflowStatusMeta } from './workflow-utils';
import { TRIGGER_TYPES, WORKFLOW_STATUSES, type TemplateId, type WorkflowSummary } from './types';

const col = createColumnHelper<WorkflowSummary>();
const triggerLabel = Object.fromEntries(TRIGGER_TYPES.map((t) => [t.value, t])) as Record<string, (typeof TRIGGER_TYPES)[number]>;

export function WorkflowsPage() {
  const canManage = useCan('workflows.manage');
  const { query, setQuery } = useTableQuery({ sort: 'updatedAt', direction: 'desc' });
  const [status, setStatus] = useState('');
  const [trigger, setTrigger] = useState('');
  const search = useDebouncedValue(query.search);
  const list = useWorkflows({ page: query.page, pageSize: query.pageSize, sort: query.sort, direction: query.direction, search, filters: { status, trigger } });

  const remove = useDeleteWorkflow();
  const duplicate = useDuplicateWorkflow();
  const run = useRunWorkflow();
  const setWorkflowStatus = useSetWorkflowStatus();
  const [deleting, setDeleting] = useState<WorkflowSummary | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [template, setTemplate] = useState<TemplateId>('blank');

  const activeFilters = Number(Boolean(status)) + Number(Boolean(trigger));
  const clearFilters = () => {
    setStatus('');
    setTrigger('');
    setQuery({ page: 1 });
  };
  const openNew = (id: TemplateId = 'blank') => {
    setTemplate(id);
    setFormOpen(true);
  };

  async function act(label: string, w: WorkflowSummary, fn: () => Promise<unknown>) {
    try {
      await fn();
      toast.success(label, { description: w.name });
    } catch (e) {
      toast.error(`Could not complete the action`, { description: errorText(e) });
    }
  }

  const columns = useMemo(
    () => [
      col.accessor('name', {
        header: 'Name',
        meta: { label: 'Name', mobile: 'primary', alwaysVisible: true },
        cell: (c) => (
          <div className="min-w-0">
            <Link href={`/workflows/${c.row.original.id}`} className="rounded font-medium text-text hover:text-primary">{c.getValue()}</Link>
            <p className="max-w-xs truncate text-xs text-text-muted">{c.row.original.description}</p>
          </div>
        ),
      }),
      col.accessor('status', { header: 'Status', cell: (c) => <Badge variant={workflowStatusMeta[c.getValue()].variant} dot>{workflowStatusMeta[c.getValue()].label}</Badge> }),
      col.accessor('trigger', {
        header: 'Trigger',
        cell: (c) => (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <IconRenderer name={triggerLabel[c.getValue()]?.icon ?? 'Zap'} className="size-4 text-text-muted" />
            {triggerLabel[c.getValue()]?.label ?? c.getValue()}
          </span>
        ),
        meta: { exportValue: (w: WorkflowSummary) => w.trigger },
      }),
      col.accessor('nextRunAt', {
        header: 'Next run',
        cell: (c) => (c.getValue() ? <span title={describeCron(c.row.original.schedule.cron)}>{new Date(c.getValue() as string).toLocaleString()}</span> : <span className="text-text-muted">—</span>),
        meta: { exportValue: (w: WorkflowSummary) => w.nextRunAt ?? '' },
      }),
      col.accessor('lastRunStatus', {
        header: 'Last run',
        cell: (c) => {
          const s = c.getValue();
          return s ? <Badge variant={runStatusMeta[s].variant}>{runStatusMeta[s].label}</Badge> : <span className="text-text-muted">Never</span>;
        },
        meta: { exportValue: (w: WorkflowSummary) => w.lastRunStatus ?? '' },
      }),
      col.accessor('owner', { header: 'Owner', meta: { mobile: 'secondary' } }),
      col.accessor('updatedAt', { header: 'Updated', cell: (c) => formatRelative(c.getValue()), meta: { exportValue: (w: WorkflowSummary) => w.updatedAt } }),
    ],
    [],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Agent Workflows"
        description="Build AI agent workflows on a visual canvas, schedule them and review every run."
        actions={
          <>
            <Button variant="secondary" asChild><Link href="/workflows/runs"><IconRenderer name="Play" className="size-4" /> Runs</Link></Button>
            {canManage && <Button onClick={() => openNew()}><IconRenderer name="Plus" className="size-4" /> New workflow</Button>}
          </>
        }
      />

      <WorkflowTemplates canManage={canManage} onPick={openNew} />

      <DataTable<WorkflowSummary>
        caption="Agent workflows"
        columns={columns}
        data={list.data?.items ?? []}
        total={list.data?.meta.total}
        getRowId={(w) => w.id}
        getRowLabel={(w) => w.name}
        mode="server"
        query={query}
        onQueryChange={setQuery}
        isLoading={list.isPending}
        isFetching={list.isFetching && !list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        searchPlaceholder="Search workflows by name, description or owner"
        exportFileName="workflows"
        hasActiveFilters={activeFilters > 0}
        onClearFilters={clearFilters}
        emptyTitle="No workflows yet"
        emptyDescription="Create your first agent workflow from a template or start with a blank canvas."
        emptyAction={canManage ? <Button onClick={() => openNew()}>New workflow</Button> : undefined}
        filters={
          <FilterBar activeCount={activeFilters} onClear={clearFilters}>
            <Select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setQuery({ page: 1 }); }} className="md:w-40">
              <option value="">All statuses</option>
              {WORKFLOW_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
            <Select aria-label="Filter by trigger" value={trigger} onChange={(e) => { setTrigger(e.target.value); setQuery({ page: 1 }); }} className="md:w-40">
              <option value="">All triggers</option>
              {TRIGGER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </FilterBar>
        }
        rowActions={(w) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${w.name}`}><IconRenderer name="MoreHorizontal" className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link href={`/workflows/${w.id}`}><IconRenderer name="Workflow" className="size-4" /> Open builder</Link></DropdownMenuItem>
              {canManage && (
                <>
                  <DropdownMenuItem disabled={w.status === 'draft'} onSelect={() => void act('Run started', w, () => run.mutateAsync(w.id))}>
                    <IconRenderer name="Play" className="size-4" /> Run now
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => void act('Workflow duplicated', w, () => duplicate.mutateAsync(w.id))}>
                    <IconRenderer name="Copy" className="size-4" /> Duplicate
                  </DropdownMenuItem>
                  {w.status !== 'draft' && (
                    <DropdownMenuItem onSelect={() => void act(w.status === 'active' ? 'Workflow paused' : 'Workflow resumed', w, () => setWorkflowStatus.mutateAsync({ id: w.id, status: w.status === 'active' ? 'paused' : 'active' }))}>
                      <IconRenderer name={w.status === 'active' ? 'Pause' : 'Play'} className="size-4" /> {w.status === 'active' ? 'Pause' : 'Resume'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive onSelect={() => setDeleting(w)}><IconRenderer name="Trash2" className="size-4" /> Delete…</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <WorkflowFormDialog open={formOpen} onOpenChange={setFormOpen} template={template} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name ?? 'workflow'}?`}
        description="The workflow, its version history and its run history are permanently removed. This can’t be undone. Type the workflow name to confirm."
        confirmLabel="Delete workflow"
        requireText={deleting?.name}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success('Workflow deleted', { description: deleting.name });
        }}
      />
    </PageContainer>
  );
}
