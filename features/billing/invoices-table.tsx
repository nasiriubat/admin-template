'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Badge, Button, DataTable, FilterBar, formatDate, IconRenderer, Select, toast, useDebouncedValue, useTableQuery } from '@nexus/ui';
import { useInvoices } from './hooks';
import { downloadTextFile, formatMoney, invoiceText } from './schemas';
import type { Invoice, InvoiceStatus } from './types';

const statusVariant: Record<InvoiceStatus, 'success' | 'warning' | 'danger'> = { paid: 'success', open: 'warning', failed: 'danger' };
const col = createColumnHelper<Invoice>();

export function InvoicesTable() {
  const { query, setQuery } = useTableQuery({ sort: 'issuedAt', direction: 'desc' });
  const [status, setStatus] = useState('');
  const search = useDebouncedValue(query.search);
  const list = useInvoices({ page: query.page, pageSize: query.pageSize, sort: query.sort, direction: query.direction, search, filters: { status } });

  const columns = useMemo(
    () => [
      col.accessor('number', { header: 'Invoice', meta: { label: 'Invoice', mobile: 'primary', alwaysVisible: true }, cell: (c) => <span className="font-medium text-text">{c.getValue()}</span> }),
      col.accessor('issuedAt', { header: 'Date', cell: (c) => formatDate(c.getValue()), meta: { exportValue: (i: Invoice) => i.issuedAt.slice(0, 10) } }),
      col.accessor('amountCents', { header: 'Amount', cell: (c) => <span className="tabular-nums">{formatMoney(c.getValue())}</span>, meta: { exportValue: (i: Invoice) => (i.amountCents / 100).toFixed(2) } }),
      col.accessor('status', { header: 'Status', cell: (c) => <Badge variant={statusVariant[c.getValue()]} dot className="capitalize">{c.getValue()}</Badge> }),
    ],
    [],
  );

  return (
    <DataTable<Invoice>
      caption="Invoices"
      columns={columns}
      data={list.data?.items ?? []}
      total={list.data?.meta.total}
      getRowId={(i) => i.id}
      getRowLabel={(i) => i.number}
      mode="server"
      query={query}
      onQueryChange={setQuery}
      isLoading={list.isPending}
      isFetching={list.isFetching && !list.isPending}
      error={list.error}
      onRetry={() => void list.refetch()}
      searchPlaceholder="Search invoices"
      exportFileName="invoices"
      hasActiveFilters={Boolean(status)}
      onClearFilters={() => { setStatus(''); setQuery({ page: 1 }); }}
      emptyTitle="No invoices yet"
      emptyDescription="Invoices appear here after your first billing cycle."
      filters={
        <FilterBar activeCount={Number(Boolean(status))} onClear={() => { setStatus(''); setQuery({ page: 1 }); }}>
          <Select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setQuery({ page: 1 }); }} className="md:w-40">
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="open">Open</option>
            <option value="failed">Failed</option>
          </Select>
        </FilterBar>
      }
      rowActions={(invoice) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Download ${invoice.number}`}
          onClick={() => {
            downloadTextFile(`${invoice.number}.txt`, invoiceText(invoice));
            toast.success('Invoice downloaded', { description: invoice.number });
          }}
        >
          <IconRenderer name="Download" className="size-4" />
        </Button>
      )}
    />
  );
}
