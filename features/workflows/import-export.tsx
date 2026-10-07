'use client';

import { useRef, useState } from 'react';
import { Alert, Button, Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, FormField, Textarea, toast } from '@nexus/ui';
import { exportWorkflow, importWorkflow, MAX_IMPORT_BYTES, type WorkflowDocument } from './workflow-io';
import type { ScheduleConfig, WorkflowGraph } from './types';

export function downloadWorkflow(input: { name: string; description: string; graph: WorkflowGraph; schedule: ScheduleConfig }) {
  const blob = new Blob([exportWorkflow(input)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'workflow'}.workflow.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Workflow exported', { description: 'Secret header values are not included.' });
}

/** Paste or upload workflow JSON. Validated with the same schema the server uses; nothing is applied until it passes. */
export function ImportDialog({ open, onOpenChange, onImport }: { open: boolean; onOpenChange: (open: boolean) => void; onImport: (doc: WorkflowDocument) => void }) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setError(`File is larger than ${MAX_IMPORT_BYTES / 1024} KB.`);
      return;
    }
    setText(await file.text());
    setError(null);
  }

  function submit() {
    const result = importWorkflow(text);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onImport(result.document);
    setText('');
    setError(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) { setText(''); setError(null); } onOpenChange(next); }}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Import workflow JSON</DialogTitle>
          <DialogDescription>Importing replaces the current graph and schedule. You can undo it, and nothing is saved until you press Save.</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3 py-3">
          {error && <Alert variant="danger">{error}</Alert>}
          <div>
            <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Choose a workflow JSON file" onChange={(e) => void onFile(e.target.files?.[0])} />
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>Choose a file…</Button>
          </div>
          <FormField label="Or paste JSON" hint={`Up to ${MAX_IMPORT_BYTES / 1024} KB. Unknown node types are rejected.`}>
            <Textarea rows={10} className="font-mono text-xs" value={text} onChange={(e) => { setText(e.target.value); setError(null); }} spellCheck={false} />
          </FormField>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!text.trim()}>Replace current graph</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
