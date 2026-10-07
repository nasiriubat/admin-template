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
  FilterBar,
  formatRelative,
  IconRenderer,
  PageContainer,
  PageHeader,
  Select,
  toast,
  useTableQuery,
} from '@nexus/ui';
import { extractVariables } from './ai-utils';
import { useDeletePrompt, usePrompts } from './hooks';
import { PromptEditorSheet } from './prompt-editor-sheet';
import type { Prompt } from './types';

const col = createColumnHelper<Prompt>();

export function AiPromptsPage() {
  const canManage = useCan('ai.manage');
  const { query, setQuery } = useTableQuery({ sort: 'updatedAt', direction: 'desc' });
  const [tag, setTag] = useState('');
  const list = usePrompts({ page: 1, pageSize: 100 });
  const remove = useDeletePrompt();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState<Prompt | null>(null);

  const all = useMemo(() => list.data?.items ?? [], [list.data]);
  const tags = useMemo(() => [...new Set(all.flatMap((p) => p.tags))].sort(), [all]);
  const rows = useMemo(() => all.filter((p) => !tag || p.tags.includes(tag)), [all, tag]);
  // Look the prompt up live so version history refreshes after a restore.
  const selected = all.find((p) => p.id === selectedId) ?? null;

  const openEditor = (prompt: Prompt | null) => {
    setSelectedId(prompt?.id ?? null);
    setSheetOpen(true);
  };
  const clearFilters = () => {
    setTag('');
    setQuery({ page: 1 });
  };

  const columns = useMemo(
    () => [
      col.accessor('name', {
        header: 'Prompt',
        meta: { label: 'Prompt', mobile: 'primary', alwaysVisible: true },
        cell: ({ row }) => (
          <button type="button" onClick={() => openEditor(row.original)} className="block min-w-0 rounded text-left">
            <span className="block truncate font-medium text-text">{row.original.name}</span>
            <span className="block truncate text-xs text-text-muted">{row.original.description}</span>
          </button>
        ),
      }),
      col.accessor('tags', {
        header: 'Tags',
        enableSorting: false,
        cell: (c) => <span className="flex flex-wrap gap-1">{c.getValue().map((t) => <Badge key={t}>{t}</Badge>)}</span>,
        meta: { exportValue: (p: Prompt) => p.tags.join(' ') },
      }),
      col.display({ id: 'variables', header: 'Variables', cell: ({ row }) => extractVariables(row.original.template).length, meta: { exportValue: (p: Prompt) => extractVariables(p.template).length } }),
      col.accessor('currentVersion', { header: 'Version', cell: (c) => `v${c.getValue()}` }),
      col.accessor('updatedAt', { header: 'Updated', cell: (c) => formatRelative(c.getValue()) }),
    ],
    [],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Prompts"
        description="Reusable prompt templates with versions you can compare and restore."
        actions={canManage && <Button onClick={() => openEditor(null)}><IconRenderer name="Plus" className="size-4" /> New prompt</Button>}
      />
      <DataTable<Prompt>
        caption="Prompt templates"
        columns={columns}
        data={rows}
        getRowId={(p) => p.id}
        getRowLabel={(p) => p.name}
        mode="client"
        query={query}
        onQueryChange={setQuery}
        isLoading={list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        searchPlaceholder="Search prompts"
        exportFileName="ai-prompts"
        hasActiveFilters={Boolean(tag)}
        onClearFilters={clearFilters}
        emptyTitle="No prompts yet"
        emptyDescription="Create a template to reuse it across features."
        emptyAction={canManage ? <Button onClick={() => openEditor(null)}>New prompt</Button> : undefined}
        filters={
          <FilterBar activeCount={Number(Boolean(tag))} onClear={clearFilters}>
            <Select aria-label="Filter by tag" value={tag} onChange={(e) => setTag(e.target.value)} className="md:w-44">
              <option value="">All tags</option>
              {tags.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </FilterBar>
        }
        rowActions={(prompt) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${prompt.name}`}><IconRenderer name="MoreHorizontal" className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => openEditor(prompt)}><IconRenderer name={canManage ? 'Pencil' : 'Eye'} className="size-4" /> {canManage ? 'Edit' : 'View'}</DropdownMenuItem>
              {canManage && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive onSelect={() => setDeleting(prompt)}><IconRenderer name="Trash2" className="size-4" /> Delete…</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <PromptEditorSheet open={sheetOpen} onOpenChange={setSheetOpen} prompt={selected} canManage={canManage} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name ?? 'prompt'}?`}
        description="The template and all of its versions are permanently removed. This can’t be undone."
        confirmLabel="Delete prompt"
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success('Prompt deleted', { description: deleting.name });
        }}
      />
    </PageContainer>
  );
}
