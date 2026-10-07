'use client';

import { useState, useEffect } from 'react';
import { useCan } from '@nexus/auth';
import {
  Button,
  Card,
  ConfirmDialog,
  FilterBar,
  PageContainer,
  PageHeader,
  Pagination,
  QueryBoundary,
  SearchInput,
  SegmentedControl,
  Select,
  Skeleton,
  toast,
  useDebouncedValue,
  EmptyState,
  IconRenderer,
} from '@nexus/ui';
import { FileRenameDialog } from './file-rename-dialog';
import { FileUploader } from './file-upload';
import { FileGrid, FileList } from './file-views';
import { useDeleteFile, useFiles } from './hooks';
import { FILE_KINDS, FILE_SORTS, type FileItem } from './types';

type View = 'list' | 'grid';
const PAGE_SIZE = 12;

function FilesSkeleton() {
  return (
    <Card className="divide-y divide-border">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </Card>
  );
}

export function FilesPage() {
  const canManage = useCan('files.manage');
  const [view, setView] = useState<View>('list');
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('');
  const [sortKey, setSortKey] = useState(FILE_SORTS[0].value);
  const [page, setPage] = useState(1);
  const [renaming, setRenaming] = useState<FileItem | null>(null);
  const [deleting, setDeleting] = useState<FileItem | null>(null);
  const debounced = useDebouncedValue(search);
  const remove = useDeleteFile();

  const sort = FILE_SORTS.find((s) => s.value === sortKey) ?? FILE_SORTS[0];
  const list = useFiles({ page, pageSize: PAGE_SIZE, sort: sort.sort, direction: sort.direction, search: debounced, filters: { kind } });

  // After deleting the last item of the last page, step back instead of showing an empty page.
  const lastPage = list.data?.meta.pages;
  useEffect(() => {
    if (lastPage !== undefined && page > lastPage) setPage(Math.max(1, lastPage));
  }, [lastPage, page]);

  const activeFilters = Number(Boolean(kind));
  const hasFilters = activeFilters > 0 || Boolean(debounced);
  const clearFilters = () => {
    setKind('');
    setSearch('');
    setPage(1);
  };

  const handlers = { canManage, onRename: setRenaming, onDelete: setDeleting };

  return (
    <PageContainer>
      <PageHeader title="Files" description="Upload, organise and share files with your workspace." />

      {canManage && <FileUploader />}

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput value={search} onValueChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search files" className="md:w-72" />
        <FilterBar activeCount={activeFilters} onClear={() => { setKind(''); setPage(1); }} className="md:flex-1">
          <Select aria-label="Filter by type" value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }} className="md:w-40">
            <option value="">All types</option>
            {FILE_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </Select>
          <Select aria-label="Sort files" value={sortKey} onChange={(e) => { setSortKey(e.target.value); setPage(1); }} className="md:w-44">
            {FILE_SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </FilterBar>
        <SegmentedControl<View> label="View" value={view} onChange={setView} options={[{ value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }]} className="md:w-40" />
      </div>

      <QueryBoundary
        query={list}
        loading={<FilesSkeleton />}
        isEmpty={(d) => d.items.length === 0}
        empty={
          hasFilters ? (
            <Card>
              <EmptyState icon="Search" title="No files match" description="Try a different search or clear the filters." actions={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>} />
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon="FolderOpen"
                title="No files yet"
                description={canManage ? 'Upload your first file to share it with the team.' : 'Files shared with the workspace will appear here.'}
                actions={canManage ? <Button onClick={() => document.querySelector<HTMLInputElement>('[data-testid="file-input"]')?.click()}><IconRenderer name="Upload" className="size-4" /> Upload files</Button> : undefined}
              />
            </Card>
          )
        }
      >
        {(data) => (
          <div className="space-y-4" aria-busy={list.isFetching}>
            {view === 'list' ? <FileList files={data.items} {...handlers} /> : <FileGrid files={data.items} {...handlers} />}
            <Pagination page={data.meta.page} pageSize={data.meta.pageSize} total={data.meta.total} onPageChange={setPage} />
          </div>
        )}
      </QueryBoundary>

      <FileRenameDialog file={renaming} onOpenChange={(open) => !open && setRenaming(null)} />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name ?? 'file'}?`}
        description="Anyone with a link to this file will lose access. This can’t be undone."
        confirmLabel="Delete file"
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success('File deleted', { description: deleting.name });
        }}
      />
    </PageContainer>
  );
}
