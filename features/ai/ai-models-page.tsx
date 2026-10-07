'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useId, useMemo, useState } from 'react';
import { useCan } from '@nexus/auth';
import {
  Badge,
  Button,
  DataTable,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FilterBar,
  IconRenderer,
  PageContainer,
  PageHeader,
  Select,
  Switch,
  toast,
  useTableQuery,
} from '@nexus/ui';
import { formatContext, formatUsd } from './ai-utils';
import { useModels, useProviders, useSetDefaultModel, useSetModelEnabled } from './hooks';
import { ModelPricingDialog } from './model-pricing-dialog';
import { TASK_TYPES, type AiModel, type TaskType } from './types';

const col = createColumnHelper<AiModel>();
/** Own radio name per instance: the table and its mobile cards both render this cell and must not share a group. */
function DefaultRadio({ label, ...props }: { label: string; checked: boolean; disabled: boolean; onChange: () => void }) {
  return <input type="radio" name={useId()} className="size-5 accent-primary [@media(pointer:coarse)]:size-6" aria-label={label} {...props} />;
}
const price = (v: number) => (v === 0 ? 'Free' : formatUsd(v));

export function AiModelsPage() {
  const canManage = useCan('ai.manage');
  const { query, setQuery } = useTableQuery({ sort: 'displayName', direction: 'asc' });
  const [providerId, setProviderId] = useState('');
  const list = useModels({ page: 1, pageSize: 100 });
  const providers = useProviders({ page: 1, pageSize: 100 });
  const toggle = useSetModelEnabled();
  const setDefault = useSetDefaultModel();
  const [pricing, setPricing] = useState<AiModel | null>(null);

  const rows = useMemo(() => (list.data?.items ?? []).filter((m) => !providerId || m.providerId === providerId), [list.data, providerId]);

  async function run(action: () => Promise<unknown>, success: string, description?: string) {
    try {
      await action();
      toast.success(success, { description });
    } catch (e) {
      toast.error('Could not update the model', { description: e instanceof Error ? e.message : undefined });
    }
  }

  const columns = useMemo(() => {
    const defaultColumn = (task: TaskType, label: string) =>
      col.display({
        id: `default-${task}`,
        header: `Default ${label.toLowerCase()}`,
        cell: ({ row }) => {
          const m = row.original;
          if (!m.capabilities.includes(task)) return <span className="text-text-muted" aria-label="Not applicable">-</span>;
          return (
            <DefaultRadio
              label={`Use ${m.displayName} as default ${task} model`}
              checked={m.defaultFor.includes(task)}
              disabled={!canManage || !m.enabled}
              onChange={() => void run(() => setDefault.mutateAsync({ id: m.id, task }), `Default ${task} model set`, m.displayName)}
            />
          );
        },
        meta: { label: `Default ${label.toLowerCase()}`, exportValue: (m: AiModel) => m.defaultFor.includes(task) },
      });
    return [
      col.accessor('displayName', {
        header: 'Model',
        meta: { label: 'Model', mobile: 'primary', alwaysVisible: true },
        cell: ({ row }) => (
          <span className="block min-w-0">
            <span className="block truncate font-medium text-text">{row.original.displayName}</span>
            <span className="block truncate text-xs text-text-muted">{row.original.providerName} · {row.original.modelId}</span>
          </span>
        ),
      }),
      col.accessor('contextWindow', { header: 'Context', cell: (c) => `${formatContext(c.getValue())} tokens` }),
      col.accessor('inputPrice', { header: 'Input / 1M', cell: (c) => price(c.getValue()) }),
      col.accessor('outputPrice', { header: 'Output / 1M', cell: (c) => price(c.getValue()) }),
      col.accessor('capabilities', {
        header: 'Capabilities',
        enableSorting: false,
        cell: (c) => <span className="flex flex-wrap gap-1">{c.getValue().map((cap) => <Badge key={cap} variant="info" className="capitalize">{cap}</Badge>)}</span>,
        meta: { exportValue: (m: AiModel) => m.capabilities.join(' ') },
      }),
      defaultColumn('chat', 'Chat'),
      defaultColumn('embedding', 'Embedding'),
      col.accessor('enabled', {
        header: 'Enabled',
        cell: ({ row }) => (
          <Switch
            aria-label={`${row.original.displayName} enabled`}
            checked={row.original.enabled}
            disabled={!canManage}
            onCheckedChange={(enabled) => void run(() => toggle.mutateAsync({ id: row.original.id, enabled }), enabled ? 'Model enabled' : 'Model disabled', row.original.displayName)}
          />
        ),
      }),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage]);

  const clearFilters = () => {
    setProviderId('');
    setQuery({ page: 1 });
  };

  return (
    <PageContainer>
      <PageHeader title="AI models" description="Choose which models are available, set default models per task and keep pricing current." />
      <DataTable<AiModel>
        caption="AI models"
        columns={columns}
        data={rows}
        getRowId={(m) => m.id}
        getRowLabel={(m) => m.displayName}
        mode="client"
        query={query}
        onQueryChange={setQuery}
        isLoading={list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        searchPlaceholder="Search models"
        exportFileName="ai-models"
        hasActiveFilters={Boolean(providerId)}
        onClearFilters={clearFilters}
        emptyTitle="No models found"
        emptyDescription="Models appear here once a provider is connected."
        filters={
          <FilterBar activeCount={Number(Boolean(providerId))} onClear={clearFilters}>
            <Select aria-label="Filter by provider" value={providerId} onChange={(e) => setProviderId(e.target.value)} className="md:w-48">
              <option value="">All providers</option>
              {(providers.data?.items ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </FilterBar>
        }
        rowActions={canManage ? (model) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${model.displayName}`}><IconRenderer name="MoreHorizontal" className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setPricing(model)}><IconRenderer name="Pencil" className="size-4" /> Edit pricing</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : undefined}
      />
      <p className="text-xs text-text-muted">Task types: {TASK_TYPES.map((t) => t.label).join(', ')}. Only enabled models can be a default.</p>
      <ModelPricingDialog model={pricing} onOpenChange={(open) => !open && setPricing(null)} />
    </PageContainer>
  );
}
