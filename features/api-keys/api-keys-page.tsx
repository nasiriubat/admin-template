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
  DropdownMenuTrigger,
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
import { ApiKeyCreateDialog } from './api-key-create-dialog';
import { ApiKeySecretDialog } from './api-key-secret-dialog';
import { useApiKeys, useRevokeApiKey } from './hooks';
import { canRevoke, maskKey } from './key-utils';
import { API_KEY_STATUSES, type ApiKey, type ApiKeyStatus, type CreatedApiKey } from './types';

const statusVariant: Record<ApiKeyStatus, 'success' | 'danger' | 'warning'> = { active: 'success', revoked: 'danger', expired: 'warning' };
const col = createColumnHelper<ApiKey>();

function ScopeBadges({ scopes }: { scopes: string[] }) {
  const shown = scopes.slice(0, 2);
  const extra = scopes.length - shown.length;
  return (
    <span className="inline-flex flex-wrap items-center gap-1 md:justify-start">
      {shown.map((s) => <Badge key={s} className="font-mono">{s}</Badge>)}
      {extra > 0 && <Badge title={scopes.slice(2).join(', ')}>+{extra}</Badge>}
    </span>
  );
}

const when = (value: string | null, fallback: string) => (value ? formatRelative(value) : <span className="text-text-muted">{fallback}</span>);

export function ApiKeysPage() {
  const canManage = useCan('apiKeys.manage');
  const { query, setQuery } = useTableQuery({ sort: 'createdAt', direction: 'desc' });
  const [status, setStatus] = useState('');
  const search = useDebouncedValue(query.search);
  const list = useApiKeys({ page: query.page, pageSize: query.pageSize, sort: query.sort, direction: query.direction, search, filters: { status } });
  const revoke = useRevokeApiKey();

  const [createOpen, setCreateOpen] = useState(false);
  // The one-time secret lives only here; closing the reveal dialog discards it.
  const [revealed, setRevealed] = useState<CreatedApiKey | null>(null);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);

  const activeFilters = Number(Boolean(status));
  const clearFilters = () => {
    setStatus('');
    setQuery({ page: 1 });
  };

  const columns = useMemo(
    () => [
      col.accessor('name', { header: 'Name', meta: { label: 'Name', mobile: 'primary', alwaysVisible: true }, cell: (c) => <span className="block truncate font-medium text-text">{c.getValue()}</span> }),
      col.display({
        id: 'key',
        header: 'Key',
        enableSorting: false,
        meta: { label: 'Key', exportValue: (k: ApiKey) => maskKey(k) },
        cell: ({ row }) => <code className="font-mono text-xs text-text">{maskKey(row.original)}</code>,
      }),
      col.accessor('scopes', {
        header: 'Scopes',
        enableSorting: false,
        cell: (c) => <ScopeBadges scopes={c.getValue()} />,
        meta: { exportValue: (k: ApiKey) => k.scopes.join(' ') },
      }),
      col.accessor('createdAt', { header: 'Created', cell: (c) => new Date(c.getValue()).toLocaleDateString(), meta: { mobile: 'hidden' } }),
      col.accessor('lastUsedAt', { header: 'Last used', cell: (c) => when(c.getValue(), 'Never'), meta: { exportValue: (k: ApiKey) => k.lastUsedAt ?? '' } }),
      col.accessor('expiresAt', { header: 'Expires', cell: (c) => (c.getValue() ? new Date(c.getValue()!).toLocaleDateString() : <span className="text-text-muted">Never</span>), meta: { exportValue: (k: ApiKey) => k.expiresAt ?? '' } }),
      col.accessor('status', { header: 'Status', cell: (c) => <Badge variant={statusVariant[c.getValue()]} dot className="capitalize">{c.getValue()}</Badge> }),
    ],
    [],
  );

  return (
    <PageContainer>
      <PageHeader
        title="API Keys"
        description="Credentials for programmatic access. Secrets are shown once when created and can’t be retrieved afterwards."
        actions={canManage && <Button onClick={() => setCreateOpen(true)}><IconRenderer name="Plus" className="size-4" /> Create key</Button>}
      />

      <DataTable<ApiKey>
        caption="API keys"
        columns={columns}
        data={list.data?.items ?? []}
        total={list.data?.meta.total}
        getRowId={(k) => k.id}
        getRowLabel={(k) => k.name}
        mode="server"
        query={query}
        onQueryChange={setQuery}
        isLoading={list.isPending}
        isFetching={list.isFetching && !list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        searchPlaceholder="Search by name or key prefix"
        exportFileName="api-keys"
        hasActiveFilters={activeFilters > 0}
        onClearFilters={clearFilters}
        emptyTitle="No API keys"
        emptyDescription="Create a key to let a service call the API on your behalf."
        emptyAction={canManage ? <Button onClick={() => setCreateOpen(true)}>Create key</Button> : undefined}
        filters={
          <FilterBar activeCount={activeFilters} onClear={clearFilters}>
            <Select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setQuery({ page: 1 }); }} className="md:w-40">
              <option value="">All statuses</option>
              {API_KEY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </FilterBar>
        }
        rowActions={(key) =>
          canManage && canRevoke(key) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Actions for ${key.name}`}>
                  <IconRenderer name="MoreHorizontal" className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem destructive onSelect={() => setRevoking(key)}>
                  <IconRenderer name="Ban" className="size-4" /> Revoke…
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null
        }
      />

      <ApiKeyCreateDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={setRevealed} />
      <ApiKeySecretDialog created={revealed} onClose={() => setRevealed(null)} />

      <ConfirmDialog
        open={Boolean(revoking)}
        onOpenChange={(open) => !open && setRevoking(null)}
        title={`Revoke ${revoking?.name ?? 'key'}?`}
        description="Anything using this key will immediately lose access. A revoked key can’t be re-activated; you would need to create a new one."
        confirmLabel="Revoke key"
        requireText={revoking?.name}
        onConfirm={async () => {
          if (!revoking) return;
          await revoke.mutateAsync(revoking.id);
          toast.success('Key revoked', { description: revoking.name });
        }}
      />
    </PageContainer>
  );
}
