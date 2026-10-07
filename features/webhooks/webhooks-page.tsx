'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useCan } from '@nexus/auth';
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FilterBar,
  formatRelative,
  IconRenderer,
  PageContainer,
  PageHeader,
  Select,
  Switch,
  toast,
  useDebouncedValue,
  useTableQuery,
} from '@nexus/ui';
import { DeliveryLog } from './delivery-log';
import { useDeleteWebhook, useRotateSecret, useSendTestEvent, useToggleWebhook, useWebhooks } from './hooks';
import { WEBHOOK_STATUSES, type Webhook, type WebhookStatus } from './types';
import { WebhookFormDialog } from './webhook-form-dialog';
import { WebhookSecretDialog } from './webhook-secret-dialog';

const statusVariant: Record<WebhookStatus, 'success' | 'neutral' | 'danger'> = { enabled: 'success', disabled: 'neutral', failing: 'danger' };
const col = createColumnHelper<Webhook>();

function EventBadges({ events }: { events: string[] }) {
  const shown = events.slice(0, 2);
  const extra = events.length - shown.length;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {shown.map((e) => <Badge key={e} className="font-mono">{e}</Badge>)}
      {extra > 0 && <Badge title={events.slice(2).join(', ')}>+{extra}</Badge>}
    </span>
  );
}

export function WebhooksPage() {
  const canManage = useCan('webhooks.manage');
  const { query, setQuery } = useTableQuery({ sort: 'createdAt', direction: 'desc' });
  const [status, setStatus] = useState('');
  const search = useDebouncedValue(query.search);
  const list = useWebhooks({ page: query.page, pageSize: query.pageSize, sort: query.sort, direction: query.direction, search, filters: { status } });
  const toggle = useToggleWebhook();
  const sendTest = useSendTestEvent();
  const remove = useDeleteWebhook();
  const rotate = useRotateSecret();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Webhook | null>(null);
  const [deleting, setDeleting] = useState<Webhook | null>(null);
  const [rotating, setRotating] = useState<Webhook | null>(null);
  // One-time secret from create or rotate. Cleared when the reveal dialog closes.
  const [reveal, setReveal] = useState<{ secret: string; title: string } | null>(null);

  const activeFilters = Number(Boolean(status));
  const clearFilters = () => {
    setStatus('');
    setQuery({ page: 1 });
  };

  async function runTest(w: Webhook) {
    try {
      const r = await sendTest.mutateAsync(w.id);
      if (r.success) toast.success('Test event delivered', { description: `${w.url} responded ${r.statusCode} in ${r.durationMs} ms.` });
      else toast.error('Test event failed', { description: `${w.url} responded ${r.statusCode} after ${r.durationMs} ms.` });
    } catch (e) {
      toast.error('Could not send test event', { description: e instanceof Error ? e.message : undefined });
    }
  }

  const columns = useMemo(
    () => [
      col.accessor('url', {
        header: 'Endpoint',
        meta: { label: 'Endpoint', mobile: 'primary', alwaysVisible: true },
        cell: ({ row }) => (
          <span className="block min-w-0">
            <span className="block truncate font-mono text-sm font-medium text-text">{row.original.url}</span>
            {row.original.description && <span className="block truncate text-xs font-normal text-text-muted">{row.original.description}</span>}
          </span>
        ),
      }),
      col.accessor('events', { header: 'Events', enableSorting: false, cell: (c) => <EventBadges events={c.getValue()} />, meta: { exportValue: (w: Webhook) => w.events.join(' ') } }),
      col.accessor('status', { header: 'Status', cell: (c) => <Badge variant={statusVariant[c.getValue()]} dot className="capitalize">{c.getValue()}</Badge> }),
      col.accessor('lastDeliveryAt', {
        header: 'Last delivery',
        cell: (c) => (c.getValue() ? formatRelative(c.getValue()!) : <span className="text-text-muted">Never</span>),
        meta: { exportValue: (w: Webhook) => w.lastDeliveryAt ?? '' },
      }),
      col.accessor('successRate', { header: 'Success rate', cell: (c) => <span className="tabular-nums">{c.getValue()}%</span> }),
      col.accessor('enabled', {
        header: 'Enabled',
        enableSorting: false,
        meta: { exportValue: (w: Webhook) => (w.enabled ? 'yes' : 'no') },
        cell: ({ row }) => (
          <span className="inline-flex min-h-11 min-w-11 items-center justify-center md:min-h-0 md:min-w-0">
            <Switch
              checked={row.original.enabled}
              disabled={!canManage}
              aria-label={`Enable ${row.original.url}`}
              onCheckedChange={(enabled) =>
                toggle.mutate({ id: row.original.id, enabled }, { onError: (e) => toast.error('Could not update endpoint', { description: e instanceof Error ? e.message : undefined }) })
              }
            />
          </span>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage],
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Webhooks"
        description="Receive signed HTTPS callbacks when events happen in your workspace."
        actions={canManage && <Button onClick={openCreate}><IconRenderer name="Plus" className="size-4" /> Add endpoint</Button>}
      />

      <DataTable<Webhook>
        caption="Webhook endpoints"
        columns={columns}
        data={list.data?.items ?? []}
        total={list.data?.meta.total}
        getRowId={(w) => w.id}
        getRowLabel={(w) => w.url}
        mode="server"
        query={query}
        onQueryChange={setQuery}
        isLoading={list.isPending}
        isFetching={list.isFetching && !list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        searchPlaceholder="Search by URL or description"
        exportFileName="webhooks"
        hasActiveFilters={activeFilters > 0}
        onClearFilters={clearFilters}
        emptyTitle="No webhook endpoints"
        emptyDescription="Add an endpoint to start receiving events."
        emptyAction={canManage ? <Button onClick={openCreate}>Add endpoint</Button> : undefined}
        renderExpanded={(w) => <DeliveryLog webhook={w} />}
        filters={
          <FilterBar activeCount={activeFilters} onClear={clearFilters}>
            <Select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setQuery({ page: 1 }); }} className="md:w-40">
              <option value="">All statuses</option>
              {WEBHOOK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </FilterBar>
        }
        rowActions={(w) =>
          canManage ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Actions for ${w.url}`}>
                  <IconRenderer name="MoreHorizontal" className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => void runTest(w)}>
                  <IconRenderer name="Send" className="size-4" /> Send test event
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { setEditing(w); setFormOpen(true); }}>
                  <IconRenderer name="Pencil" className="size-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setRotating(w)}>
                  <IconRenderer name="RefreshCw" className="size-4" /> Rotate secret…
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onSelect={() => setDeleting(w)}>
                  <IconRenderer name="Trash2" className="size-4" /> Delete…
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null
        }
      />

      <WebhookFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        webhook={editing}
        onCreated={(c) => setReveal({ secret: c.secret, title: 'Your signing secret' })}
      />
      <WebhookSecretDialog secret={reveal?.secret ?? null} title={reveal?.title ?? ''} onClose={() => setReveal(null)} />

      <ConfirmDialog
        open={Boolean(rotating)}
        onOpenChange={(open) => !open && setRotating(null)}
        tone="primary"
        title="Rotate signing secret?"
        description="The current secret stops working immediately. Update your receiver with the new secret, or deliveries will fail signature checks."
        confirmLabel="Rotate secret"
        onConfirm={async () => {
          if (!rotating) return;
          const result = await rotate.run(rotating.id);
          setReveal({ secret: result.secret, title: 'Your new signing secret' });
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this endpoint?"
        description={`${deleting?.url ?? 'This endpoint'} will stop receiving events and its delivery history is removed. This can’t be undone.`}
        confirmLabel="Delete endpoint"
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success('Endpoint deleted', { description: deleting.url });
        }}
      />
    </PageContainer>
  );
}
