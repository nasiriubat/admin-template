'use client';

import { useState } from 'react';
import { Badge, Button, ConfirmDialog, formatRelative, Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle, toast } from '@nexus/ui';
import { useRestoreVersion } from './hooks';
import type { Workflow, WorkflowVersion } from './types';

export function VersionHistorySheet({ open, onOpenChange, workflow, canManage, dirty, onRestored }: { open: boolean; onOpenChange: (open: boolean) => void; workflow: Workflow; canManage: boolean; dirty: boolean; onRestored: (w: Workflow) => void }) {
  const restore = useRestoreVersion();
  const [target, setTarget] = useState<WorkflowVersion | null>(null);
  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader><SheetTitle>Version history</SheetTitle><SheetDescription>Every save creates a version. Restoring creates a new one, so nothing is lost.</SheetDescription></SheetHeader>
          <SheetBody>
            <ol aria-label="Versions" className="space-y-2">
              {workflow.versions.map((v) => (
                <li key={v.version} className="rounded-input border border-border bg-surface p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text">Version {v.version}</span>
                    {v.version === workflow.version && <Badge variant="primary">Current</Badge>}
                  </div>
                  <p className="text-sm text-text-muted">{v.note}</p>
                  <p className="text-xs text-text-muted">{v.author} · <time dateTime={v.savedAt}>{formatRelative(v.savedAt)}</time> · {v.nodeCount} nodes</p>
                  {canManage && v.version !== workflow.version && <Button className="mt-2" size="sm" variant="secondary" onClick={() => setTarget(v)} aria-label={`Restore version ${v.version}`}>Restore…</Button>}
                </li>
              ))}
            </ol>
          </SheetBody>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(o) => !o && setTarget(null)}
        title={`Restore version ${target?.version ?? ''}?`}
        description={`The canvas is replaced with version ${target?.version ?? ''}${dirty ? ' and your unsaved changes are discarded' : ''}. A new version is created.`}
        confirmLabel="Restore version"
        tone="primary"
        onConfirm={async () => {
          if (!target) return;
          const updated = await restore.mutateAsync({ id: workflow.id, version: target.version });
          onRestored(updated);
          toast.success(`Version ${target.version} restored`);
          onOpenChange(false);
        }}
      />
    </>
  );
}
