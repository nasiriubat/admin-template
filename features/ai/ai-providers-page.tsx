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
  formatRelative,
  IconRenderer,
  PageContainer,
  PageHeader,
  Switch,
  toast,
  useTableQuery,
} from '@nexus/ui';
import { maskKey } from './ai-utils';
import { useDeleteProvider, useProviders, useSetProviderEnabled, useTestProvider } from './hooks';
import { ProviderFormDialog } from './provider-form-dialog';
import { PROVIDER_TYPES, type Provider, type ProviderStatus } from './types';

const statusVariant: Record<ProviderStatus, 'success' | 'danger' | 'neutral'> = { connected: 'success', error: 'danger', disabled: 'neutral' };
const typeLabel = (t: string) => PROVIDER_TYPES.find((x) => x.value === t)?.label ?? t;
const col = createColumnHelper<Provider>();

export function AiProvidersPage() {
  const canManage = useCan('ai.manage');
  const { query, setQuery } = useTableQuery({ sort: 'name', direction: 'asc' });
  const list = useProviders({ page: 1, pageSize: 100 });
  const toggle = useSetProviderEnabled();
  const test = useTestProvider();
  const remove = useDeleteProvider();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Provider | null>(null);
  const [replaceKey, setReplaceKey] = useState(false);
  const [deleting, setDeleting] = useState<Provider | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const openForm = (provider: Provider | null, replace = false) => {
    setEditing(provider);
    setReplaceKey(replace);
    setFormOpen(true);
  };

  async function runTest(provider: Provider) {
    setTestingId(provider.id);
    try {
      const result = await test.mutateAsync(provider.id);
      if (result.ok) toast.success(`${provider.name} is reachable`, { description: `${result.message} (${result.latencyMs} ms)` });
      else toast.error(`${provider.name} is not reachable`, { description: result.message });
    } catch (e) {
      toast.error('Could not test the connection', { description: e instanceof Error ? e.message : undefined });
    } finally {
      setTestingId(null);
    }
  }

  async function setEnabled(provider: Provider, enabled: boolean) {
    try {
      await toggle.mutateAsync({ id: provider.id, enabled });
      toast.success(enabled ? 'Provider enabled' : 'Provider disabled', { description: provider.name });
    } catch (e) {
      toast.error('Could not update the provider', { description: e instanceof Error ? e.message : undefined });
    }
  }

  const columns = useMemo(
    () => [
      col.accessor('name', { header: 'Provider', meta: { label: 'Provider', mobile: 'primary', alwaysVisible: true }, cell: (c) => <span className="font-medium text-text">{c.getValue()}</span> }),
      col.accessor('type', { header: 'Type', cell: (c) => typeLabel(c.getValue()), meta: { exportValue: (p: Provider) => typeLabel(p.type) } }),
      col.accessor('baseUrl', { header: 'Base URL', cell: (c) => <span className="block max-w-64 truncate font-mono text-xs text-text-muted" title={c.getValue()}>{c.getValue()}</span> }),
      col.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant[row.original.status]} dot className="capitalize">{row.original.status}</Badge>
            {canManage && row.original.status !== 'disabled' && (
              <Button size="sm" variant="secondary" loading={testingId === row.original.id} onClick={() => void runTest(row.original)} aria-label={`Test connection for ${row.original.name}`}>
                Test connection
              </Button>
            )}
          </span>
        ),
      }),
      col.display({
        id: 'key',
        header: 'API key',
        cell: ({ row }) => <code className="text-xs text-text-muted">{maskKey(row.original.keyPrefix, row.original.keyLast4)}</code>,
        meta: { exportValue: (p: Provider) => maskKey(p.keyPrefix, p.keyLast4) },
      }),
      col.accessor('lastCheckedAt', {
        header: 'Last checked',
        cell: (c) => (c.getValue() ? formatRelative(c.getValue()!) : <span className="text-text-muted">Never</span>),
        meta: { mobile: 'hidden', exportValue: (p: Provider) => p.lastCheckedAt ?? '' },
      }),
      col.display({
        id: 'enabled',
        header: 'Enabled',
        cell: ({ row }) => (
          <Switch
            aria-label={`${row.original.name} enabled`}
            checked={row.original.status !== 'disabled'}
            disabled={!canManage || toggle.isPending}
            onCheckedChange={(checked) => void setEnabled(row.original, checked)}
          />
        ),
        meta: { exportValue: (p: Provider) => p.status !== 'disabled' },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage, testingId, toggle.isPending],
  );

  return (
    <PageContainer>
      <PageHeader
        title="AI providers"
        description="Connect the model providers your workspace can call. API keys are write-only."
        actions={canManage && <Button onClick={() => openForm(null)}><IconRenderer name="Plus" className="size-4" /> Add provider</Button>}
      />
      <DataTable<Provider>
        caption="AI providers"
        columns={columns}
        data={list.data?.items ?? []}
        getRowId={(p) => p.id}
        getRowLabel={(p) => p.name}
        mode="client"
        query={query}
        onQueryChange={setQuery}
        isLoading={list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        searchPlaceholder="Search providers"
        exportFileName="ai-providers"
        emptyTitle="No providers yet"
        emptyDescription="Add a provider to start routing requests to a model."
        emptyAction={canManage ? <Button onClick={() => openForm(null)}>Add provider</Button> : undefined}
        rowActions={canManage ? (provider) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${provider.name}`}><IconRenderer name="MoreHorizontal" className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => openForm(provider)}><IconRenderer name="Pencil" className="size-4" /> Edit</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openForm(provider, true)}><IconRenderer name="KeyRound" className="size-4" /> Replace key</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => setDeleting(provider)}><IconRenderer name="Trash2" className="size-4" /> Delete…</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : undefined}
      />

      <ProviderFormDialog open={formOpen} onOpenChange={setFormOpen} provider={editing} replaceKey={replaceKey} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name ?? 'provider'}?`}
        description="Its stored key and every model registered under it are removed, and requests that use it will fail. This can’t be undone."
        confirmLabel="Delete provider"
        requireText={deleting?.name}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success('Provider deleted', { description: deleting.name });
        }}
      />
    </PageContainer>
  );
}
