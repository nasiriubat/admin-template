'use client';

import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type Row,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import { downloadCsv, toCsv } from '../../lib/csv';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';
import { ErrorState } from '../patterns/error-state';
import { EmptyState } from '../patterns/empty-state';
import { UnauthorizedState } from '../patterns/unauthorized-state';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Pagination } from '../ui/pagination';
import { SearchInput, Select } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import type { TableQuery } from './use-table-query';

/** Extra per-column hints on top of TanStack's ColumnDef. Pass through `meta`. */
export interface DataTableColumnMeta {
  /** Human label used in the column menu, mobile cards and CSV export. Defaults to the header string. */
  label?: string;
  /** Role on mobile record cards. `primary` becomes the card title. Default `secondary`. */
  mobile?: 'primary' | 'secondary' | 'hidden';
  /** Prevent hiding via the column menu (e.g. the name column). */
  alwaysVisible?: boolean;
  /** Value used for CSV export. Defaults to the raw accessor value. */
  exportValue?: (row: never) => unknown;
  className?: string;
}

export interface DataTableProps<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  data: T[];
  getRowId: (row: T) => string;
  /** Used in aria labels, e.g. the person's name. */
  getRowLabel?: (row: T) => string;
  /** Required for assistive tech: what this table lists. */
  caption: string;

  /** `client` sorts/filters/paginates `data` locally; `server` expects pre-paged data and `total`. */
  mode?: 'client' | 'server';
  total?: number;
  query: TableQuery;
  onQueryChange: (patch: Partial<TableQuery>) => void;

  isLoading?: boolean;
  /** True during background refetches (shows a subtle busy state, keeps rows visible). */
  isFetching?: boolean;
  error?: unknown;
  onRetry?: () => void;

  searchPlaceholder?: string;
  /** Filter controls; pass a <FilterBar>. */
  filters?: ReactNode;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  /** Buttons shown at the right of the toolbar (e.g. "Invite user"). */
  toolbarActions?: ReactNode;

  selectable?: boolean;
  /** Bulk actions for the current selection. Called with the selected rows and a clear function. */
  bulkActions?: (rows: T[], clear: () => void) => ReactNode;
  rowActions?: (row: T) => ReactNode;
  renderExpanded?: (row: T) => ReactNode;
  /** Override the generated mobile card for a row. */
  renderMobileCard?: (row: T) => ReactNode;

  /** Enables the CSV export button. Server-side exports can pass `onExport` instead. */
  exportFileName?: string;
  onExport?: () => void;

  emptyTitle?: string;
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;
  pageSizeOptions?: number[];
  /** Max height of the scrollable table body on desktop (enables the sticky header). */
  maxHeightClass?: string;
  className?: string;
}

const metaOf = <T,>(column: Column<T, unknown>) => (column.columnDef.meta ?? {}) as DataTableColumnMeta;
const labelOf = <T,>(column: Column<T, unknown>) =>
  metaOf(column).label ?? (typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id);

export function DataTable<T>({
  columns,
  data,
  getRowId,
  getRowLabel,
  caption,
  mode = 'client',
  total,
  query,
  onQueryChange,
  isLoading,
  isFetching,
  error,
  onRetry,
  searchPlaceholder = 'Search…',
  filters,
  hasActiveFilters,
  onClearFilters,
  toolbarActions,
  selectable,
  bulkActions,
  rowActions,
  renderExpanded,
  renderMobileCard,
  exportFileName,
  onExport,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
  pageSizeOptions,
  maxHeightClass = 'max-h-[70dvh]',
  className,
}: DataTableProps<T>) {
  const server = mode === 'server';
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const sorting: SortingState = query.sort ? [{ id: query.sort, desc: query.direction === 'desc' }] : [];

  const table = useReactTable<T>({
    data,
    columns: columns as ColumnDef<T, unknown>[],
    getRowId,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      globalFilter: server ? undefined : query.search,
      pagination: { pageIndex: query.page - 1, pageSize: query.pageSize },
    },
    manualSorting: server,
    manualPagination: server,
    manualFiltering: server,
    pageCount: server ? Math.max(1, Math.ceil((total ?? data.length) / query.pageSize)) : undefined,
    enableRowSelection: Boolean(selectable),
    enableMultiSort: false,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      onQueryChange({ sort: next[0]?.id, direction: next[0]?.desc ? 'desc' : 'asc' });
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: server ? undefined : getSortedRowModel(),
    getFilteredRowModel: server ? undefined : getFilteredRowModel(),
    getPaginationRowModel: server ? undefined : getPaginationRowModel(),
    getExpandedRowModel: renderExpanded ? getExpandedRowModel() : undefined,
    getRowCanExpand: renderExpanded ? () => true : undefined,
  });

  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns().filter((c) => c.id !== '__select' && c.id !== '__actions');
  const totalRows = server ? (total ?? data.length) : table.getFilteredRowModel().rows.length;
  const selectedRows = useMemo(() => table.getSelectedRowModel().rows.map((r) => r.original), [table, rowSelection, data]); // eslint-disable-line react-hooks/exhaustive-deps
  const clearSelection = () => setRowSelection({});
  const hasSearch = query.search.trim().length > 0;
  const sortableColumns = table.getAllLeafColumns().filter((c) => c.getCanSort());
  const colSpan = visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0) + (renderExpanded ? 1 : 0);

  function exportCsv() {
    if (onExport) return onExport();
    const cols = visibleColumns;
    const source = server ? rows : table.getPrePaginationRowModel().rows;
    const csv = toCsv(
      cols.map(labelOf),
      source.map((row) =>
        cols.map((col) => {
          const meta = metaOf(col);
          return meta.exportValue ? (meta.exportValue as (r: T) => unknown)(row.original) : row.getValue(col.id);
        }),
      ),
    );
    downloadCsv(exportFileName ?? 'export', csv);
  }

  // If rows were deleted and the current page no longer exists (server mode), go to the last one.
  const lastPage = Math.max(1, Math.ceil(totalRows / query.pageSize));
  useEffect(() => {
    if (server && !isLoading && !isFetching && !error && query.page > lastPage) onQueryChange({ page: lastPage });
  }, [server, isLoading, isFetching, error, query.page, lastPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const showEmpty = !isLoading && !error && rows.length === 0;

  return (
    <div className={cn('rounded-card border border-border bg-surface shadow-card', className)} aria-busy={isLoading || isFetching || undefined}>
      {/* Toolbar */}
      <div className="space-y-3 border-b border-border p-3 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
          <SearchInput
            value={query.search}
            onValueChange={(search) => onQueryChange({ search })}
            placeholder={searchPlaceholder}
            className="md:w-72"
          />
          <div className="min-w-0 md:flex-1">{filters}</div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {sortableColumns.length > 0 && (
              <div className="flex items-center gap-1.5 md:hidden">
                <Select
                  aria-label="Sort by"
                  value={query.sort ?? ''}
                  onChange={(e) => onQueryChange({ sort: e.target.value || undefined })}
                  className="h-10 w-40"
                >
                  <option value="">Sort: default</option>
                  {sortableColumns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {labelOf(c)}
                    </option>
                  ))}
                </Select>
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label={`Sort direction: ${query.direction === 'asc' ? 'ascending' : 'descending'}`}
                  onClick={() => onQueryChange({ direction: query.direction === 'asc' ? 'desc' : 'asc' })}
                >
                  <IconRenderer name={query.direction === 'asc' ? 'ArrowUp' : 'ArrowDown'} className="size-4" />
                </Button>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" aria-label="Choose columns" className="hidden md:inline-flex">
                  <IconRenderer name="Columns3" className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Columns</DropdownMenuLabel>
                {table
                  .getAllLeafColumns()
                  .filter((c) => c.getCanHide() && !metaOf(c).alwaysVisible && c.id !== '__select' && c.id !== '__actions')
                  .map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c.id}
                      checked={c.getIsVisible()}
                      onCheckedChange={(v) => c.toggleVisibility(Boolean(v))}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {labelOf(c)}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {(exportFileName || onExport) && (
              <Button variant="secondary" onClick={exportCsv} disabled={rows.length === 0} aria-label="Export CSV">
                <IconRenderer name="FileDown" className="size-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}
            {toolbarActions}
          </div>
        </div>

        {selectable && selectedRows.length > 0 && bulkActions && (
          <div
            role="region"
            aria-label="Bulk actions"
            className="flex flex-wrap items-center gap-2 rounded-input border border-primary/30 bg-primary/10 px-3 py-2 text-sm"
          >
            <span className="font-medium text-text" aria-live="polite">
              {selectedRows.length} selected
            </span>
            <div className="flex flex-wrap items-center gap-2">{bulkActions(selectedRows, clearSelection)}</div>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={clearSelection}>
              Clear selection
            </Button>
          </div>
        )}
      </div>

      {/* Body */}
      {error ? (
        (error as { status?: number }).status === 403 || (error as { status?: number }).status === 401 ? (
          <UnauthorizedState reason={(error as { status?: number }).status === 401 ? 'signed-out' : 'forbidden'} />
        ) : (
          <ErrorState error={error} onRetry={onRetry} />
        )
      ) : isLoading ? (
        <LoadingRows columns={Math.min(visibleColumns.length, 5)} />
      ) : showEmpty ? (
        hasSearch || hasActiveFilters ? (
          <EmptyState
            icon="Search"
            title="No matching results"
            description="Try a different search term or remove some filters."
            actions={
              <Button
                variant="secondary"
                onClick={() => {
                  onQueryChange({ search: '' });
                  onClearFilters?.();
                }}
              >
                Clear search and filters
              </Button>
            }
          />
        ) : (
          <EmptyState icon="Inbox" title={emptyTitle} description={emptyDescription} actions={emptyAction} />
        )
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className={cn('hidden overflow-auto md:block custom-scrollbar', maxHeightClass, isFetching && 'opacity-70 transition-opacity')}>
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">{caption}</caption>
              <thead className="sticky top-0 z-[1] bg-surface">
                <tr className="border-b border-border">
                  {renderExpanded && <th scope="col" className="w-10 px-2"><span className="sr-only">Expand</span></th>}
                  {selectable && (
                    <th scope="col" className="w-10 px-3">
                      <Checkbox
                        aria-label="Select all rows on this page"
                        checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false}
                        onCheckedChange={(v) => table.toggleAllPageRowsSelected(Boolean(v))}
                      />
                    </th>
                  )}
                  {visibleColumns.map((column) => {
                    const sorted = column.getIsSorted();
                    const header = table.getFlatHeaders().find((h) => h.column.id === column.id);
                    return (
                      <th
                        key={column.id}
                        scope="col"
                        aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : column.getCanSort() ? 'none' : undefined}
                        className={cn('whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted', metaOf(column).className)}
                      >
                        {column.getCanSort() ? (
                          <button
                            type="button"
                            onClick={column.getToggleSortingHandler()}
                            className="-mx-1 inline-flex items-center gap-1.5 rounded px-1 py-0.5 uppercase hover:text-text"
                          >
                            {header ? flexRender(column.columnDef.header, header.getContext()) : labelOf(column)}
                            <IconRenderer
                              name={sorted === 'asc' ? 'ArrowUp' : sorted === 'desc' ? 'ArrowDown' : 'ArrowUpDown'}
                              className={cn('size-3.5', !sorted && 'opacity-50')}
                            />
                          </button>
                        ) : header ? (
                          flexRender(column.columnDef.header, header.getContext())
                        ) : (
                          labelOf(column)
                        )}
                      </th>
                    );
                  })}
                  {rowActions && (
                    <th scope="col" className="w-12 px-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <Fragment key={row.id}>
                    <tr
                      className={cn('min-h-row border-b border-border last:border-0 hover:bg-canvas/60', row.getIsSelected() && 'bg-primary/5')}
                      data-state={row.getIsSelected() ? 'selected' : undefined}
                    >
                      {renderExpanded && (
                        <td className="px-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 min-h-0 min-w-0"
                            aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
                            aria-expanded={row.getIsExpanded()}
                            onClick={row.getToggleExpandedHandler()}
                          >
                            <IconRenderer name={row.getIsExpanded() ? 'ChevronDown' : 'ChevronRight'} className="size-4" />
                          </Button>
                        </td>
                      )}
                      {selectable && (
                        <td className="px-3">
                          <Checkbox
                            aria-label={`Select ${getRowLabel?.(row.original) ?? 'row'}`}
                            checked={row.getIsSelected()}
                            onCheckedChange={(v) => row.toggleSelected(Boolean(v))}
                          />
                        </td>
                      )}
                      {row.getVisibleCells().filter((c) => c.column.id !== '__select' && c.column.id !== '__actions').map((cell) => (
                        <td key={cell.id} className={cn('px-4 py-2.5 align-middle text-text', metaOf(cell.column).className)}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                      {rowActions && <td className="px-3 text-right">{rowActions(row.original)}</td>}
                    </tr>
                    {renderExpanded && row.getIsExpanded() && (
                      <tr className="border-b border-border bg-canvas/50">
                        <td colSpan={colSpan} className="px-6 py-4">
                          {renderExpanded(row.original)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile records: wide tables are never squeezed into small widths. */}
          <ul className={cn('divide-y divide-border md:hidden', isFetching && 'opacity-70')} aria-label={caption}>
            {rows.map((row) => (
              <li key={row.id} className="p-4">
                {renderMobileCard ? (
                  renderMobileCard(row.original)
                ) : (
                  <MobileRecord
                    row={row}
                    selectable={selectable}
                    label={getRowLabel?.(row.original)}
                    actions={rowActions?.(row.original)}
                    expanded={row.getIsExpanded() ? renderExpanded?.(row.original) : undefined}
                    canExpand={Boolean(renderExpanded)}
                  />
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {!error && !isLoading && totalRows > 0 && (
        <div className="border-t border-border p-3 md:p-4">
          <Pagination
            page={query.page}
            pageSize={query.pageSize}
            total={totalRows}
            pageSizeOptions={pageSizeOptions}
            onPageChange={(page) => onQueryChange({ page })}
            onPageSizeChange={(pageSize) => onQueryChange({ pageSize })}
          />
        </div>
      )}
    </div>
  );
}

function MobileRecord<T>({
  row,
  selectable,
  label,
  actions,
  expanded,
  canExpand,
}: {
  row: Row<T>;
  selectable?: boolean;
  label?: string;
  actions?: ReactNode;
  expanded?: ReactNode;
  canExpand: boolean;
}) {
  const cells = row.getVisibleCells().filter((c) => c.column.id !== '__select' && c.column.id !== '__actions');
  const primary = cells.find((c) => metaOf(c.column).mobile === 'primary') ?? cells[0];
  const rest = cells.filter((c) => c !== primary && metaOf(c.column).mobile !== 'hidden');

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        {selectable && (
          <Checkbox
            className="mt-1"
            aria-label={`Select ${label ?? 'row'}`}
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(Boolean(v))}
          />
        )}
        <div className="min-w-0 flex-1 font-medium text-text">
          {primary && flexRender(primary.column.columnDef.cell, primary.getContext())}
        </div>
        {actions}
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        {rest.map((cell) => (
          <Fragment key={cell.id}>
            <dt className="text-text-muted">{labelOf(cell.column)}</dt>
            <dd className="min-w-0 text-right text-text">{flexRender(cell.column.columnDef.cell, cell.getContext())}</dd>
          </Fragment>
        ))}
      </dl>
      {canExpand && (
        <Button variant="ghost" size="sm" onClick={row.getToggleExpandedHandler()} aria-expanded={row.getIsExpanded()}>
          {row.getIsExpanded() ? 'Hide details' : 'Show details'}
        </Button>
      )}
      {expanded && <div className="rounded-input bg-canvas p-3 text-sm">{expanded}</div>}
    </div>
  );
}

function LoadingRows({ columns }: { columns: number }) {
  return (
    <div role="status" aria-label="Loading data" className="divide-y divide-border">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <Skeleton className="size-9 rounded-full" />
          <div className="grid flex-1 gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(columns - 1, 1)}, minmax(0, 1fr))` }}>
            {Array.from({ length: Math.max(columns - 1, 1) }, (_, j) => (
              <Skeleton key={j} className={cn('h-4', j === 0 ? 'w-3/4' : 'w-1/2', 'max-md:[&:nth-child(n+3)]:hidden')} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
