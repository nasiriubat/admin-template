'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ConfirmDialog, toast } from '@nexus/ui';
import { useDeleteWorkspace, useResetDemoData } from './hooks';

/** Destructive actions live apart from normal settings, in a danger-tinted card (docs/FORMS.md). */
export function DangerZone({ readOnly, workspaceName }: { readOnly: boolean; workspaceName: string }) {
  const [dialog, setDialog] = useState<'reset' | 'delete' | null>(null);
  const reset = useResetDemoData();
  const del = useDeleteWorkspace();

  return (
    <>
      <Card className="border-danger/50">
        <CardHeader>
          <div>
            <CardTitle className="text-danger">Danger zone</CardTitle>
            <CardDescription>These actions are hard to undo. You will be asked to confirm.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-text">Reset demo data</p>
              <p className="text-sm text-text-muted">Restore every setting and sample record to its original demo values.</p>
            </div>
            <Button variant="secondary" disabled={readOnly} onClick={() => setDialog('reset')}>Reset demo data…</Button>
          </div>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-text">Delete workspace</p>
              <p className="text-sm text-text-muted">Permanently remove this workspace, its members and all data.</p>
            </div>
            <Button variant="danger" disabled={readOnly} onClick={() => setDialog('delete')}>Delete workspace…</Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={dialog === 'reset'}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Reset demo data?"
        description="All settings return to their defaults. Changes you made in this demo will be lost."
        confirmLabel="Reset data"
        requireText="RESET"
        onConfirm={async () => {
          await reset.mutateAsync();
          toast.success('Demo data reset');
        }}
      />
      <ConfirmDialog
        open={dialog === 'delete'}
        onOpenChange={(open) => !open && setDialog(null)}
        title={`Delete ${workspaceName}?`}
        description="This permanently deletes the workspace, every member and all of its data. This can’t be undone."
        confirmLabel="Delete workspace"
        requireText={workspaceName}
        onConfirm={async () => {
          await del.mutateAsync();
          toast.success('Workspace deletion requested', { description: 'In the demo nothing is actually removed.' });
        }}
      />
    </>
  );
}
