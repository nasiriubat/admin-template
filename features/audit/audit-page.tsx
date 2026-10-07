'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useCan } from '@nexus/auth';
import {
  Alert,
  Badge,
  Button,
  DataTable,
  downloadCsv,
  FilterBar,
  formatDateTime,
  IconRenderer,
  Input,
  PageContainer,
  PageHeader,
  Select,
  toast,
  toCsv,
  UnauthorizedState,
  useDebouncedValue,
  useTableQuery,
} from '@nexus/ui';
import type { ListQuery } from '@nexus/api-client';
import { AuditDetails } from './audit-diff';
import { useAuditEvents } from './hooks';
import { validateDateRange } from './schemas';
import { auditService } from './service';
import { actionLabel, AUDIT_ACTIONS, AUDIT_ACTORS, AUDIT_RESOURCE_TYPES, resourceLabel, type AuditAction, type AuditEvent } from './types';

const actionVariant: Record<AuditAction, 'success' | 'info' | 'danger' | 'neutral' | 'primary'> = {
  create: 'success',
  update: 'info',
  delete: 'danger',
  login: 'primary',
  logout: 'neutral',
  export: 'neutral',
};
const col = createColumnHelper<AuditEvent>();

export function AuditPage() {
  const canView = useCan('audit.view');
  const { query, setQuery } = useTableQuery({ sort: 'timestamp', direction: 'desc' });
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [actorId, setActorId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const search = useDebouncedValue(query.search);

  const rangeError = validateDateRange({ from, to });
  const listQuery: ListQuery = {
    page: query.page,
    pageSize: query.pageSize,
    sort: query.sort,
    direction: query.direction,
    search,
    // An invalid range is never sent to the server.
    filters: { action, resourceType, actorId, from: rangeError ? '' : from, to: rangeError ? '' : to },
  };
  const list = useAuditEvents(listQuery);
  const [exporting, setExporting] = useState(false);

  const activeFilters = [action, resourceType, actorId, from, to].filter(Boolean).length;
  const clearFilters = () => {
    setAction('');
    setResourceType('');
    setActorId('');
    setFrom('');
    setTo('');
    setQuery({ page: 1 });
  };
  const change = (set: (v: string) => void) => (e: { target: { value: string } }) => {
    set(e.target.value);
    setQuery({ page: 1 });
  };

  const columns = useMemo(
    () => [
      col.accessor('timestamp', { header: 'When', cell: (c) => <time dateTime={c.getValue()} className="whitespace-nowrap">{formatDateTime(c.getValue())}</time>, meta: { label: 'When', mobile: 'secondary' } }),
      col.accessor('actorName', {
        header: 'Actor',
        meta: { label: 'Actor', mobile: 'primary', alwaysVisible: true, exportValue: (e: AuditEvent) => `${e.actorName} <${e.actorEmail}>` },
        cell: ({ row }) => (
          <span className="block min-w-0">
            <span className="block truncate font-medium text-text">{row.original.actorName}</span>
            <span className="block truncate text-xs text-text-muted">{row.original.actorEmail}</span>
          </span>
        ),
      }),
      col.accessor('action', { header: 'Action', cell: (c) => <Badge variant={actionVariant[c.getValue()]}>{actionLabel(c.getValue())}</Badge>, meta: { exportValue: (e: AuditEvent) => e.action } }),
      col.accessor('resourceType', { header: 'Resource', cell: (c) => resourceLabel(c.getValue()), meta: { exportValue: (e: AuditEvent) => e.resourceType } }),
      col.accessor('resourceId', { header: 'Resource ID', cell: (c) => <code className="font-mono text-xs">{c.getValue()}</code> }),
      col.accessor('ip', { header: 'IP', cell: (c) => <code className="font-mono text-xs">{c.getValue()}</code>, meta: { mobile: 'hidden' } }),
      col.accessor('userAgent', { header: 'Client', cell: (c) => <span className="block max-w-48 truncate" title={c.getValue()}>{c.getValue()}</span>, meta: { mobile: 'hidden' } }),
    ],
    [],
  );

  if (!canView) return <UnauthorizedState size="page" />;
  if ((list.error as { status?: number } | null)?.status === 403) return <UnauthorizedState size="page" />;

  async function exportCsv() {
    setExporting(true);
    try {
      const events = await auditService.listAll({ ...listQuery, page: 1 });
      downloadCsv(
        'audit-log',
        toCsv(
          ['Timestamp', 'Actor', 'Actor email', 'Action', 'Resource type', 'Resource ID', 'IP', 'Client', 'Old value', 'New value'],
          events.map((e) => [e.timestamp, e.actorName, e.actorEmail, e.action, e.resourceType, e.resourceId, e.ip, e.userAgent, e.oldValue ? JSON.stringify(e.oldValue) : '', e.newValue ? JSON.stringify(e.newValue) : '']),
        ),
      );
      toast.success(`Exported ${events.length} events`);
    } catch (e) {
      toast.error('Could not export the audit log', { description: e instanceof Error ? e.message : undefined });
    } finally {
      setExporting(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader title="Audit Log" description="A read-only record of who did what, and when." />

      <DataTable<AuditEvent>
        caption="Audit events"
        columns={columns}
        data={list.data?.items ?? []}
        total={list.data?.meta.total}
        getRowId={(e) => e.id}
        getRowLabel={(e) => `${actionLabel(e.action)} ${e.resourceType} ${e.resourceId}`}
        mode="server"
        query={query}
        onQueryChange={setQuery}
        isLoading={list.isPending}
        isFetching={list.isFetching && !list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        searchPlaceholder="Search actor, resource or IP"
        hasActiveFilters={activeFilters > 0 || query.search.length > 0}
        onClearFilters={clearFilters}
        emptyTitle="No audit events found"
        emptyDescription="Nothing matches the current filters. Try widening the date range."
        renderExpanded={(e) => <AuditDetails event={e} />}
        toolbarActions={
          <Button variant="secondary" onClick={() => void exportCsv()} loading={exporting}>
            <IconRenderer name="Download" className="size-4" /> Export CSV
          </Button>
        }
        filters={
          <FilterBar activeCount={activeFilters} onClear={clearFilters}>
            <Select aria-label="Filter by action" value={action} onChange={change(setAction)} className="md:w-36">
              <option value="">All actions</option>
              {AUDIT_ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </Select>
            <Select aria-label="Filter by resource type" value={resourceType} onChange={change(setResourceType)} className="md:w-36">
              <option value="">All resources</option>
              {AUDIT_RESOURCE_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
            <Select aria-label="Filter by actor" value={actorId} onChange={change(setActorId)} className="md:w-40">
              <option value="">All actors</option>
              {AUDIT_ACTORS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
            <div className="flex items-center gap-2">
              <Input type="date" aria-label="From date" value={from} max={to || undefined} onChange={change(setFrom)} aria-invalid={Boolean(rangeError)} className="md:w-40" />
              <span className="text-text-muted" aria-hidden="true">to</span>
              <Input type="date" aria-label="To date" value={to} min={from || undefined} onChange={change(setTo)} aria-invalid={Boolean(rangeError)} className="md:w-40" />
            </div>
          </FilterBar>
        }
      />
      {rangeError && <Alert variant="warning" className="mt-3">{rangeError} The date filter isn’t applied until it’s fixed.</Alert>}
    </PageContainer>
  );
}
