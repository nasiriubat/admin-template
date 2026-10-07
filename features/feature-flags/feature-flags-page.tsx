'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useCan } from '@nexus/auth';
import {
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
import { FlagFormDialog } from './flag-form-dialog';
import { useDeleteFlag, useFeatureFlags, useToggleFlag } from './hooks';
import { FLAG_ENVIRONMENTS, type FeatureFlag, type FlagEnvironment } from './types';

const col = createColumnHelper<FeatureFlag>();

function RolloutBar({ value }: { value: number }) {
  return (
    <div className="flex items-center justify-end gap-2 md:justify-start" aria-label={`Rollout ${value}%`}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border" aria-hidden="true">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
      <span className="w-9 text-xs tabular-nums text-text-muted">{value}%</span>
    </div>
  );
}

export function FeatureFlagsPage() {
  const canManage = useCan('featureFlags.manage');
  const { query, setQuery } = useTableQuery({ sort: 'updatedAt', direction: 'desc' });
  const [environment, setEnvironment] = useState('');
  const [status, setStatus] = useState('');
  const search = useDebouncedValue(query.search);

  const list = useFeatureFlags({ page: query.page, pageSize: query.pageSize, sort: query.sort, direction: query.direction, search, filters: { environment, status } });
  const toggle = useToggleFlag();
  const remove = useDeleteFlag();

  const [editing, setEditing] = useState<FeatureFlag | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<FeatureFlag | null>(null);

  const activeFilters = Number(Boolean(environment)) + Number(Boolean(status));
  const clearFilters = () => {
    setEnvironment('');
    setStatus('');
    setQuery({ page: 1 });
  };

  const onToggle = (flag: FeatureFlag, env: FlagEnvironment, enabled: boolean) =>
    toggle.mutate(
      { id: flag.id, environment: env, enabled },
      { onError: (e) => toast.error(`Could not update ${flag.key}`, { description: e instanceof Error ? e.message : undefined }) },
    );

  const columns = useMemo(
    () => [
      col.accessor('key', {
        header: 'Flag',
        meta: { label: 'Flag', mobile: 'primary', alwaysVisible: true },
        cell: ({ row }) => (
          <span className="block min-w-0">
            <span className="block truncate font-mono text-sm font-medium text-text">{row.original.key}</span>
            {row.original.description && <span className="block truncate text-xs font-normal text-text-muted">{row.original.description}</span>}
          </span>
        ),
      }),
      ...FLAG_ENVIRONMENTS.map((env) =>
        col.accessor((f) => f.environments[env.value], {
          id: env.value,
          header: env.label,
          enableSorting: false,
          meta: { label: env.label, exportValue: (f: FeatureFlag) => (f.environments[env.value] ? 'on' : 'off') },
          cell: ({ row }) => (
            <span className="inline-flex min-h-11 min-w-11 items-center justify-center md:min-h-0 md:min-w-0">
              <Switch
                checked={row.original.environments[env.value]}
                disabled={!canManage}
                onCheckedChange={(checked) => onToggle(row.original, env.value, checked)}
                aria-label={`${row.original.key} in ${env.label}`}
              />
            </span>
          ),
        }),
      ),
      col.accessor('rollout', { header: 'Rollout', cell: (c) => <RolloutBar value={c.getValue()} /> }),
      col.accessor('owner', { header: 'Owner', meta: { mobile: 'hidden' } }),
      col.accessor('updatedAt', { header: 'Updated', cell: (c) => formatRelative(c.getValue()), meta: { exportValue: (f: FeatureFlag) => f.updatedAt } }),
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
        title="Feature Flags"
        description="Switch features on per environment and control how much of your audience sees them."
        actions={
          canManage && (
            <Button onClick={openCreate}>
              <IconRenderer name="Plus" className="size-4" /> Create flag
            </Button>
          )
        }
      />

      <DataTable<FeatureFlag>
        caption="Feature flags"
        columns={columns}
        data={list.data?.items ?? []}
        total={list.data?.meta.total}
        getRowId={(f) => f.id}
        getRowLabel={(f) => f.key}
        mode="server"
        query={query}
        onQueryChange={setQuery}
        isLoading={list.isPending}
        isFetching={list.isFetching && !list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        searchPlaceholder="Search by key, description or owner"
        exportFileName="feature-flags"
        hasActiveFilters={activeFilters > 0}
        onClearFilters={clearFilters}
        emptyTitle="No feature flags"
        emptyDescription="Create a flag to start rolling features out safely."
        emptyAction={canManage ? <Button onClick={openCreate}>Create flag</Button> : undefined}
        filters={
          <FilterBar activeCount={activeFilters} onClear={clearFilters}>
            <Select aria-label="Filter by environment" value={environment} onChange={(e) => { setEnvironment(e.target.value); setQuery({ page: 1 }); }} className="md:w-44">
              <option value="">All environments</option>
              {FLAG_ENVIRONMENTS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
            </Select>
            <Select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setQuery({ page: 1 }); }} className="md:w-40">
              <option value="">Any status</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </Select>
          </FilterBar>
        }
        rowActions={(flag) =>
          canManage ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Actions for ${flag.key}`}>
                  <IconRenderer name="MoreHorizontal" className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => { setEditing(flag); setFormOpen(true); }}>
                  <IconRenderer name="Pencil" className="size-4" /> Edit rollout
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onSelect={() => setDeleting(flag)}>
                  <IconRenderer name="Trash2" className="size-4" /> Delete…
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null
        }
      />

      <FlagFormDialog open={formOpen} onOpenChange={setFormOpen} flag={editing} existingKeys={(list.data?.items ?? []).map((f) => f.key)} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.key ?? 'flag'}?`}
        description="Code that still reads this flag will fall back to its default value. This can’t be undone."
        confirmLabel="Delete flag"
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success('Flag deleted', { description: deleting.key });
        }}
      />
    </PageContainer>
  );
}
