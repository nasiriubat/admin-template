'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useCan } from '@nexus/auth';
import {
  Alert,
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
  formatBytes,
  formatRelative,
  IconRenderer,
  PageContainer,
  PageHeader,
  Select,
  toast,
  useDebouncedValue,
  useTableQuery,
} from '@nexus/ui';
import { DocumentUploader } from './document-upload';
import { useKnowledgeDocuments, useKnowledgeSources, useReindexDocuments, useRemoveDocument } from './hooks';
import { DOCUMENT_STATUSES, type DocumentStatus, type KnowledgeDocument } from './types';

const statusVariant: Record<DocumentStatus, 'neutral' | 'info' | 'success' | 'danger'> = { queued: 'neutral', indexing: 'info', indexed: 'success', failed: 'danger' };
const col = createColumnHelper<KnowledgeDocument>();

/** Expanded row: first chunks as indexed, or why indexing failed. */
function DocumentDetail({ doc }: { doc: KnowledgeDocument }) {
  if (doc.status === 'failed') {
    return <Alert variant="danger" title="Indexing failed">{doc.failureReason ?? 'The document could not be indexed.'}</Alert>;
  }
  if (doc.chunkPreview.length === 0) {
    return <p className="text-sm text-text-muted">No chunks yet. They appear here once indexing completes.</p>;
  }
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Chunk preview ({doc.chunks} total)</p>
      <ol className="space-y-2">
        {doc.chunkPreview.map((text, i) => (
          <li key={i} className="rounded-input border border-border bg-surface px-3 py-2 text-sm text-text">
            <span className="mr-2 text-xs font-medium text-text-muted">#{i + 1}</span>
            {text}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function KnowledgeDocumentsPage() {
  const canManage = useCan('knowledge.manage');
  const { query, setQuery } = useTableQuery({ sort: 'updatedAt', direction: 'desc' });
  const [status, setStatus] = useState('');
  const [sourceId, setSourceId] = useState('');
  const search = useDebouncedValue(query.search);

  const list = useKnowledgeDocuments({ page: query.page, pageSize: query.pageSize, sort: query.sort, direction: query.direction, search, filters: { status, sourceId } });
  const sources = useKnowledgeSources({ pageSize: 100 });
  const reindex = useReindexDocuments();
  const remove = useRemoveDocument();
  const [deleting, setDeleting] = useState<KnowledgeDocument | null>(null);

  const activeFilters = Number(Boolean(status)) + Number(Boolean(sourceId));
  const clearFilters = () => {
    setStatus('');
    setSourceId('');
    setQuery({ page: 1 });
  };

  async function runReindex(ids: string[], clear?: () => void) {
    try {
      await reindex.mutateAsync(ids);
      toast.success(ids.length === 1 ? 'Re-index started' : `Re-indexing ${ids.length} documents`);
      clear?.();
    } catch (e) {
      toast.error('Could not start re-indexing', { description: e instanceof Error ? e.message : undefined });
    }
  }

  const columns = useMemo(
    () => [
      col.accessor('title', {
        header: 'Title',
        meta: { label: 'Title', mobile: 'primary', alwaysVisible: true },
        cell: (c) => <span className="block max-w-xs truncate font-medium text-text">{c.getValue()}</span>,
      }),
      col.accessor('sourceName', { header: 'Source', cell: (c) => <span className="block max-w-[12rem] truncate">{c.getValue()}</span> }),
      col.accessor('type', { header: 'Type', cell: (c) => <span className="uppercase">{c.getValue()}</span> }),
      col.accessor('size', { header: 'Size', cell: (c) => formatBytes(c.getValue()), meta: { exportValue: (d: KnowledgeDocument) => d.size } }),
      col.accessor('status', {
        header: 'Status',
        cell: (c) => <Badge variant={statusVariant[c.getValue()]} dot className="capitalize">{c.getValue()}</Badge>,
      }),
      col.accessor('chunks', { header: 'Chunks', cell: (c) => c.getValue().toLocaleString() }),
      col.accessor('updatedAt', { header: 'Updated', cell: (c) => formatRelative(c.getValue()), meta: { exportValue: (d: KnowledgeDocument) => d.updatedAt } }),
    ],
    [],
  );

  return (
    <PageContainer>
      <PageHeader title="Knowledge documents" description="Files that are chunked and indexed so they can be searched and cited." />

      {canManage && <DocumentUploader />}

      <DataTable<KnowledgeDocument>
        caption="Knowledge documents"
        columns={columns}
        data={list.data?.items ?? []}
        total={list.data?.meta.total}
        getRowId={(d) => d.id}
        getRowLabel={(d) => d.title}
        mode="server"
        query={query}
        onQueryChange={setQuery}
        isLoading={list.isPending}
        isFetching={list.isFetching && !list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        searchPlaceholder="Search documents"
        selectable={canManage}
        exportFileName="knowledge-documents"
        hasActiveFilters={activeFilters > 0}
        onClearFilters={clearFilters}
        emptyTitle="No documents yet"
        emptyDescription={canManage ? 'Upload a PDF, Markdown, text or Word file to start building your knowledge base.' : 'Documents added to the knowledge base will appear here.'}
        renderExpanded={(d) => <DocumentDetail doc={d} />}
        filters={
          <FilterBar activeCount={activeFilters} onClear={clearFilters}>
            <Select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setQuery({ page: 1 }); }} className="md:w-40">
              <option value="">All statuses</option>
              {DOCUMENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
            <Select aria-label="Filter by source" value={sourceId} onChange={(e) => { setSourceId(e.target.value); setQuery({ page: 1 }); }} className="md:w-48">
              <option value="">All sources</option>
              {(sources.data?.items ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </FilterBar>
        }
        bulkActions={(rows, clear) => (
          <Button size="sm" variant="secondary" loading={reindex.isPending} onClick={() => void runReindex(rows.map((r) => r.id), clear)}>
            <IconRenderer name="RefreshCw" className="size-4" /> Re-index
          </Button>
        )}
        rowActions={
          canManage
            ? (doc) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Actions for ${doc.title}`}>
                      <IconRenderer name="MoreHorizontal" className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => void runReindex([doc.id])}>
                      <IconRenderer name="RefreshCw" className="size-4" /> Re-index
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive onSelect={() => setDeleting(doc)}>
                      <IconRenderer name="Trash2" className="size-4" /> Delete…
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            : undefined
        }
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.title ?? 'document'}?`}
        description="The document and its indexed chunks are removed from the knowledge base. This can’t be undone."
        confirmLabel="Delete document"
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success('Document deleted', { description: deleting.title });
        }}
      />
    </PageContainer>
  );
}
