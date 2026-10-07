'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, cn, FormField, IconRenderer, Input } from '@nexus/ui';
import type { WorkflowEditor } from './editor-state';
import { NODE_CATALOG } from './node-catalog';
import { NodeForm, type ModelOption } from './node-form';

function NodeName({ id, label, readOnly, editor }: { id: string; label: string; readOnly: boolean; editor: WorkflowEditor }) {
  const [draft, setDraft] = useState(label);
  useEffect(() => setDraft(label), [label, editor.revision]);
  const error = draft.trim() ? undefined : 'Give the node a name.';
  return (
    <FormField label="Node name" error={error}>
      <Input
        value={draft}
        maxLength={80}
        disabled={readOnly}
        onChange={(e) => {
          setDraft(e.target.value);
          if (e.target.value.trim()) editor.updateNode(id, { label: e.target.value }, `label:${id}`);
        }}
      />
    </FormField>
  );
}

/** Right-hand panel (desktop) or sheet content (mobile) for the selected node. */
export function NodeInspector({ editor, models, readOnly, onRequestDelete, className }: { editor: WorkflowEditor; models: ModelOption[]; readOnly: boolean; onRequestDelete: () => void; className?: string }) {
  const { selectedNodes } = editor;
  const node = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const onConfig = useCallback((config: Record<string, unknown>) => { if (node) editor.updateNode(node.id, { config }); }, [editor.updateNode, node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (selectedNodes.length > 1) {
    return (
      <div className={cn('space-y-3', className)} aria-label="Inspector">
        <p className="text-sm font-medium text-text">{selectedNodes.length} nodes selected</p>
        <p className="text-sm text-text-muted">Select a single node to edit its settings. Arrow keys move the selection together.</p>
        {!readOnly && <Button variant="danger-ghost" onClick={onRequestDelete}><IconRenderer name="Trash2" className="size-4" /> Delete {selectedNodes.length} nodes…</Button>}
      </div>
    );
  }
  if (!node) {
    return (
      <div className={cn('space-y-2 text-sm text-text-muted', className)} aria-label="Inspector">
        <p className="font-medium text-text">Inspector</p>
        <p>Select a node on the canvas, or choose one in the Outline tab, to edit its settings.</p>
      </div>
    );
  }
  const spec = NODE_CATALOG[node.data.kind];
  return (
    <section className={cn('space-y-4', className)} aria-label={`${spec.label} settings`}>
      <div className="flex items-start gap-2.5">
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', spec.tone)}><IconRenderer name={spec.icon} className="size-4" /></span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-text">{spec.label}</h2>
          <p className="text-xs text-text-muted">{spec.description}</p>
        </div>
      </div>
      <fieldset disabled={readOnly} className="min-w-0 space-y-4 border-0 p-0">
        <NodeName id={node.id} label={node.data.label} readOnly={readOnly} editor={editor} />
        <NodeForm key={`${node.id}:${editor.revision}`} kind={node.data.kind} config={node.data.config} models={models} readOnly={readOnly} onChange={onConfig} />
      </fieldset>
      {!readOnly && <Button variant="danger-ghost" onClick={onRequestDelete}><IconRenderer name="Trash2" className="size-4" /> Delete node…</Button>}
    </section>
  );
}
