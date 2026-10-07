'use client';

import { useState } from 'react';
import { useCan } from '@nexus/auth';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  formatRelative,
  IconRenderer,
  PageContainer,
  PageHeader,
  QueryBoundary,
  Skeleton,
  Switch,
  toast,
} from '@nexus/ui';
import { useKnowledgeSources, useRemoveSource, useSetSourcePaused, useSyncSource } from './hooks';
import { SourceFormDialog } from './source-form-dialog';
import { SCHEDULES, sourceTypeMeta, type KnowledgeSource, type SourceStatus } from './types';

const statusVariant: Record<SourceStatus, 'success' | 'neutral' | 'info' | 'danger'> = { active: 'success', paused: 'neutral', syncing: 'info', error: 'danger' };
const scheduleLabel = (s: KnowledgeSource['schedule']) => SCHEDULES.find((x) => x.value === s)?.label ?? s;

function SourceCard({ source, canManage, onDelete }: { source: KnowledgeSource; canManage: boolean; onDelete: (s: KnowledgeSource) => void }) {
  const sync = useSyncSource();
  const pause = useSetSourcePaused();
  const meta = sourceTypeMeta(source.type);
  const paused = source.status === 'paused';

  const fail = (title: string, e: unknown) => toast.error(title, { description: e instanceof Error ? e.message : undefined });

  return (
    <li>
      <Card className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-input bg-primary/10 text-primary">
            <IconRenderer name={meta.icon} className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-text">{source.name}</h2>
            <p className="truncate text-xs text-text-muted">{meta.label} · {source.location}</p>
          </div>
          <Badge variant={statusVariant[source.status]} dot className="capitalize">{source.status}</Badge>
        </div>

        <dl className="grid grid-cols-3 gap-2 text-xs">
          <div><dt className="text-text-muted">Schedule</dt><dd className="font-medium text-text">{scheduleLabel(source.schedule)}</dd></div>
          <div><dt className="text-text-muted">Last sync</dt><dd className="font-medium text-text">{source.lastSyncAt ? formatRelative(source.lastSyncAt) : 'Never'}</dd></div>
          <div><dt className="text-text-muted">Documents</dt><dd className="font-medium text-text">{source.documentCount.toLocaleString()}</dd></div>
        </dl>

        {source.errorMessage && <p role="alert" className="text-xs font-medium text-danger">{source.errorMessage}</p>}
        <p className="text-xs text-text-muted">{source.hasCredential ? 'Credential stored (hidden).' : 'No credential stored.'}</p>

        {canManage && (
          <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <label className="flex min-h-9 items-center gap-2 text-xs font-medium text-text">
              <Switch
                checked={!paused}
                disabled={pause.isPending}
                aria-label={`${paused ? 'Resume' : 'Pause'} syncing for ${source.name}`}
                onCheckedChange={(on) => pause.mutate({ id: source.id, paused: !on }, { onError: (e) => fail('Could not update source', e), onSuccess: () => toast.success(on ? 'Source resumed' : 'Source paused', { description: source.name }) })}
              />
              {paused ? 'Paused' : 'Syncing'}
            </label>
            <div className="ml-auto flex items-center gap-1">
              <Button size="sm" variant="secondary" disabled={paused} loading={sync.isPending} aria-label={`Sync ${source.name} now`} onClick={() => sync.mutate(source.id, { onError: (e) => fail('Sync failed', e), onSuccess: () => toast.success('Sync complete', { description: source.name }) })}>
                <IconRenderer name="RefreshCw" className="size-4" /> Sync now
              </Button>
              <Button size="icon" variant="danger-ghost" aria-label={`Delete ${source.name}`} onClick={() => onDelete(source)}>
                <IconRenderer name="Trash2" className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </li>
  );
}

export function KnowledgeSourcesPage() {
  const canManage = useCan('knowledge.manage');
  const list = useKnowledgeSources({ pageSize: 100, sort: 'name', direction: 'asc' });
  const remove = useRemoveSource();
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<KnowledgeSource | null>(null);

  const addButton = canManage ? (
    <Button onClick={() => setFormOpen(true)}>
      <IconRenderer name="Plus" className="size-4" /> Add source
    </Button>
  ) : undefined;

  return (
    <PageContainer>
      <PageHeader title="Knowledge sources" description="Connectors that pull documents into the knowledge base on a schedule." actions={addButton} />

      <QueryBoundary
        query={{ data: list.data, isPending: list.isPending, isError: list.isError, error: list.error, refetch: list.refetch }}
        loading={
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => <li key={i}><Skeleton className="h-44 w-full" /></li>)}
          </ul>
        }
        isEmpty={(d) => d.items.length === 0}
        empty={<EmptyState icon="Database" size="page" title="No sources connected" description={canManage ? 'Add a website, repository or storage bucket to start syncing documents.' : 'Connected sources will appear here.'} actions={addButton} />}
      >
        {(data) => (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Sources">
            {data.items.map((s) => <SourceCard key={s.id} source={s} canManage={canManage} onDelete={setDeleting} />)}
          </ul>
        )}
      </QueryBoundary>

      <SourceFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name ?? 'source'}?`}
        description="The connector and all documents it imported are removed from the knowledge base. This can’t be undone."
        confirmLabel="Delete source"
        requireText={deleting?.name}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success('Source deleted', { description: deleting.name });
        }}
      />
    </PageContainer>
  );
}
