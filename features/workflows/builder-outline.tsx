'use client';

import { useState } from 'react';
import { Badge, Button, cn, IconRenderer, Select, toast } from '@nexus/ui';
import type { WorkflowEditor } from './editor-state';
import { canConnect } from './graph';
import { DEFAULT_LABELS, NODE_CATALOG, nodeSummary, PALETTE_KINDS } from './node-catalog';
import type { NodeKind } from './types';

/**
 * Accessible list view of the graph: every node, what it connects to, and controls to add,
 * connect and disconnect without a pointer. Equivalent in power to dragging on the canvas.
 */
export function BuilderOutline({ editor, readOnly, onRequestDeleteNode, onEditNode }: { editor: WorkflowEditor; readOnly: boolean; onRequestDeleteNode: (id: string) => void; onEditNode: (id: string) => void }) {
  const { graph } = editor;
  const [addKind, setAddKind] = useState<NodeKind>('llm');
  const [targets, setTargets] = useState<Record<string, string>>({});
  const [branches, setBranches] = useState<Record<string, string>>({});
  const label = (id: string) => graph.nodes.find((n) => n.id === id)?.label ?? id;
  const ordered = [...graph.nodes].sort((a, b) => a.position.x - b.position.x || a.position.y - b.position.y);

  function connect(source: string, type: NodeKind) {
    const target = targets[source];
    if (!target) return;
    const sourceHandle = type === 'condition' ? (branches[source] ?? 'true') : null;
    const result = editor.connect({ source, target, sourceHandle });
    if (result.ok) {
      toast.success(`Connected ${label(source)} to ${label(target)}`);
      setTargets((t) => ({ ...t, [source]: '' }));
    } else toast.error(result.reason);
  }

  return (
    <section aria-label="Workflow outline" className="space-y-4">
      {!readOnly && (
        <div className="flex flex-wrap items-end gap-2 rounded-card border border-border bg-surface p-3">
          <div className="min-w-48 flex-1">
            <label htmlFor="outline-add-kind" className="mb-1.5 block text-sm font-medium text-text">Add a node</label>
            <Select id="outline-add-kind" value={addKind} onChange={(e) => setAddKind(e.target.value as NodeKind)}>
              {PALETTE_KINDS.map((k) => <option key={k} value={k}>{DEFAULT_LABELS[k]}</option>)}
            </Select>
          </div>
          <Button onClick={() => { const r = editor.addNode(addKind); if (!r.ok) toast.error(r.reason); else toast.success(`${DEFAULT_LABELS[addKind]} added`); }}><IconRenderer name="Plus" className="size-4" /> Add node</Button>
        </div>
      )}

      {ordered.length === 0 ? (
        <p className="rounded-card border border-dashed border-border-strong p-6 text-center text-sm text-text-muted">This workflow has no nodes yet. Add a trigger to begin.</p>
      ) : (
        <ol className="space-y-3">
          {ordered.map((node, index) => {
            const spec = NODE_CATALOG[node.type];
            const outgoing = graph.edges.filter((e) => e.source === node.id);
            const selected = editor.selectedNodes.some((n) => n.id === node.id);
            const options = graph.nodes.filter((t) => t.id !== node.id && canConnect(graph, { source: node.id, target: t.id, sourceHandle: node.type === 'condition' ? (branches[node.id] ?? 'true') : null }).ok);
            return (
              <li key={node.id} className={cn('rounded-card border bg-surface p-3', selected ? 'border-primary ring-1 ring-primary/40' : 'border-border')}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs tabular-nums text-text-muted">{index + 1}.</span>
                  <span className={cn('grid size-7 place-items-center rounded-lg', spec.tone)}><IconRenderer name={spec.icon} className="size-4" /></span>
                  <h3 className="text-sm font-semibold text-text">{node.label}</h3>
                  <Badge>{spec.label}</Badge>
                  {selected && <Badge variant="primary">Selected</Badge>}
                  <div className="ml-auto flex gap-1">
                    <Button size="sm" variant="secondary" aria-pressed={selected} onClick={() => onEditNode(node.id)} aria-label={`${selected ? 'Selected' : 'Select'} ${node.label} to edit its settings`}>{selected ? 'Editing' : 'Edit settings'}</Button>
                    {!readOnly && <Button size="sm" variant="danger-ghost" aria-label={`Delete ${node.label}`} onClick={() => onRequestDeleteNode(node.id)}><IconRenderer name="Trash2" className="size-4" /></Button>}
                  </div>
                </div>
                <p className="mt-1 text-sm text-text-muted">{nodeSummary(node)}</p>

                <div className="mt-2">
                  <p className="text-xs font-medium text-text-muted">Connects to</p>
                  {outgoing.length === 0 ? (
                    <p className="text-sm text-text-muted">{spec.hasOutput ? 'Nothing yet.' : 'Outputs end the workflow.'}</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {outgoing.map((e) => (
                        <li key={e.id} className="flex items-center justify-between gap-2 text-sm">
                          <span><IconRenderer name="ArrowRight" className="mr-1 inline size-3.5 text-text-muted" />{label(e.target)}{e.sourceHandle ? <Badge variant={e.sourceHandle === 'true' ? 'success' : 'danger'} className="ml-2">{e.sourceHandle} branch</Badge> : null}</span>
                          {!readOnly && <Button size="sm" variant="ghost" aria-label={`Remove connection from ${node.label} to ${label(e.target)}`} onClick={() => editor.remove([], [e.id])}><IconRenderer name="X" className="size-4" /></Button>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {!readOnly && spec.hasOutput && (
                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    {node.type === 'condition' && (
                      <div className="w-28">
                        <label htmlFor={`branch-${node.id}`} className="mb-1 block text-xs font-medium text-text-muted">Branch</label>
                        <Select id={`branch-${node.id}`} value={branches[node.id] ?? 'true'} onChange={(e) => setBranches((b) => ({ ...b, [node.id]: e.target.value }))}>
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </Select>
                      </div>
                    )}
                    <div className="min-w-44 flex-1">
                      <label htmlFor={`connect-${node.id}`} className="mb-1 block text-xs font-medium text-text-muted">Connect {node.label} to…</label>
                      <Select id={`connect-${node.id}`} value={targets[node.id] ?? ''} onChange={(e) => setTargets((t) => ({ ...t, [node.id]: e.target.value }))}>
                        <option value="">Choose a node</option>
                        {options.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </Select>
                    </div>
                    <Button size="sm" variant="secondary" disabled={!targets[node.id]} onClick={() => connect(node.id, node.type)} aria-label={`Connect ${node.label}`}>Connect</Button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
