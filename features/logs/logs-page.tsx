'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  cn,
  DataTable,
  downloadCsv,
  FilterBar,
  formatDateTime,
  IconRenderer,
  PageContainer,
  PageHeader,
  Switch,
  toast,
  toCsv,
  useDebouncedValue,
  useTableQuery,
} from '@nexus/ui';
import { useLogs } from './hooks';
import { countActiveFilters, LogFilterControls, type LogFilterState } from './log-filters';
import { formatContext, liveTailPauseReason, LOG_CSV_HEADERS, logRowsForCsv } from './logs-utils';
import { logsService } from './service';
import { LOG_LEVELS, type LogEntry } from './types';

const col = createColumnHelper<LogEntry>();
const levelMeta = Object.fromEntries(LOG_LEVELS.map((l) => [l.value, l])) as Record<string, (typeof LOG_LEVELS)[number]>;
const EMPTY_FILTERS: LogFilterState = { levels: [], service: '', range: '' };

function LogDetails({ entry }: { entry: LogEntry }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Context</p>
      <pre
        tabIndex={0}
        aria-label={`JSON context for request ${entry.requestId}`}
        className="custom-scrollbar max-h-64 overflow-auto rounded-input border border-border bg-surface p-3 font-mono text-xs leading-relaxed text-text"
      >
        {formatContext(entry.context)}
      </pre>
    </div>
  );
}

export function LogsPage() {
  const { query, setQuery } = useTableQuery({ sort: 'timestamp', direction: 'desc', pageSize: 25 });
  const [filters, setFilters] = useState<LogFilterState>(EMPTY_FILTERS);
  const [liveTail, setLiveTail] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [exporting, setExporting] = useState(false);
  const search = useDebouncedValue(query.search);

  const pauseReason = liveTail ? liveTailPauseReason({ page: query.page, sort: query.sort, direction: query.direction, paused: userPaused }) : null;
  const polling = liveTail && !pauseReason;

  const listQuery = useMemo(
    () => ({
      page: query.page,
      pageSize: query.pageSize,
      sort: query.sort,
      direction: query.direction,
      search,
      filters: { level: filters.levels, service: filters.service, range: filters.range },
    }),
    [query.page, query.pageSize, query.sort, query.direction, search, filters],
  );
  const list = useLogs(listQuery, polling);

  const columns = useMemo(
    () => [
      col.accessor('timestamp', {
        header: 'Time',
        meta: { label: 'Time', mobile: 'primary', alwaysVisible: true, className: 'whitespace-nowrap' },
        cell: (c) => <time dateTime={c.getValue()} className="font-mono text-xs">{formatDateTime(c.getValue())}</time>,
      }),
      col.accessor('level', {
        header: 'Level',
        cell: (c) => (
          <Badge variant={levelMeta[c.getValue()]?.variant} dot>
            {levelMeta[c.getValue()]?.label ?? c.getValue()}
          </Badge>
        ),
      }),
      col.accessor('service', { header: 'Service', cell: (c) => <span className="font-mono text-xs">{c.getValue()}</span> }),
      col.accessor('message', {
        header: 'Message',
        enableSorting: false,
        meta: { className: 'max-w-md' },
        cell: (c) => <span className="line-clamp-2 break-words text-sm">{c.getValue()}</span>,
      }),
      col.accessor('requestId', {
        header: 'Request ID',
        enableSorting: false,
        cell: (c) => <span className="font-mono text-xs text-text-muted">{c.getValue()}</span>,
      }),
    ],
    [],
  );

  const activeFilters = countActiveFilters(filters);
  const updateFilters = (next: LogFilterState) => {
    setFilters(next);
    setQuery({ page: 1 });
  };
  const clearFilters = () => updateFilters(EMPTY_FILTERS);

  async function exportCsv() {
    setExporting(true);
    try {
      const rows = await logsService.exportAll({ search, sort: 'timestamp', direction: 'desc', filters: listQuery.filters });
      downloadCsv('logs', toCsv(LOG_CSV_HEADERS, logRowsForCsv(rows)));
      toast.success(`Exported ${rows.length} log entries`);
    } catch (e) {
      toast.error('Could not export logs', { description: e instanceof Error ? e.message : undefined });
    } finally {
      setExporting(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Logs"
        description="Search and inspect application logs across every service."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {liveTail && (
              <Badge variant={polling ? 'success' : 'warning'} role="status" aria-live="polite">
                <span aria-hidden="true" className={cn('size-1.5 rounded-full bg-current', polling && 'motion-safe:animate-pulse')} />
                {polling ? 'Live' : (pauseReason ?? 'Paused')}
              </Badge>
            )}
            {liveTail && (
              <Button variant="secondary" size="sm" onClick={() => setUserPaused((p) => !p)} aria-pressed={userPaused}>
                <IconRenderer name={userPaused ? 'Play' : 'Pause'} className="size-4" />
                {userPaused ? 'Resume' : 'Pause'}
              </Button>
            )}
            <label className="flex min-h-9 items-center gap-2 text-sm text-text">
              <Switch
                checked={liveTail}
                onCheckedChange={(on) => {
                  setLiveTail(on);
                  setUserPaused(false);
                  if (on) setQuery({ sort: 'timestamp', direction: 'desc', page: 1 });
                }}
                aria-label="Live tail"
              />
              Live tail
            </label>
          </div>
        }
      />

      <DataTable<LogEntry>
        caption="Application logs, newest first"
        columns={columns}
        data={list.data?.items ?? []}
        total={list.data?.meta.total}
        getRowId={(e) => e.id}
        getRowLabel={(e) => e.message}
        mode="server"
        query={query}
        onQueryChange={setQuery}
        isLoading={list.isPending}
        isFetching={list.isFetching && !list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        searchPlaceholder="Search message, service or request ID"
        renderExpanded={(entry) => <LogDetails entry={entry} />}
        pageSizeOptions={[25, 50, 100]}
        onExport={() => void exportCsv()}
        toolbarActions={exporting ? <span className="sr-only" role="status">Exporting logs…</span> : undefined}
        hasActiveFilters={activeFilters > 0}
        onClearFilters={clearFilters}
        emptyTitle="No log entries"
        emptyDescription="Entries appear here as your services write logs."
        filters={
          <FilterBar activeCount={activeFilters} onClear={clearFilters}>
            <LogFilterControls value={filters} onChange={updateFilters} />
          </FilterBar>
        }
      />
    </PageContainer>
  );
}
