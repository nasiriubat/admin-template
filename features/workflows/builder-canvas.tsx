'use client';

import '@xyflow/react/dist/style.css';
import { Background, BackgroundVariant, Controls, MiniMap, Panel, ReactFlow, useReactFlow, type Connection as FlowConnection } from '@xyflow/react';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type KeyboardEvent } from 'react';
import { Button, IconRenderer, Label, Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle, Switch, toast, useMediaQuery } from '@nexus/ui';
import type { RunOverlay, WorkflowEditor } from './editor-state';
import { nodeTypes } from './flow-nodes';
import { canConnect } from './graph';
import { DEFAULT_LABELS } from './node-catalog';
import { DRAG_MIME, NodePalette } from './node-palette';
import type { NodeKind } from './types';

/** React Flow reads these variables; mapping them to design tokens keeps both themes correct. */
const FLOW_THEME = {
  '--xy-edge-stroke-props': 'rgb(var(--text-muted-rgb))',
  '--xy-edge-stroke-selected-props': 'rgb(var(--primary-rgb))',
  '--xy-connectionline-stroke-props': 'rgb(var(--primary-rgb))',
  '--xy-background-color-props': 'rgb(var(--canvas-rgb))',
  '--xy-background-pattern-color-props': 'rgb(var(--border-rgb))',
  '--xy-minimap-background-color-props': 'rgb(var(--surface-rgb))',
  '--xy-minimap-mask-background-color-props': 'rgb(var(--canvas-rgb) / 0.7)',
  '--xy-controls-button-background-color-props': 'rgb(var(--surface-rgb))',
  '--xy-controls-button-background-color-hover-props': 'rgb(var(--canvas-rgb))',
  '--xy-controls-button-color-props': 'rgb(var(--text-rgb))',
  '--xy-controls-button-border-color-props': 'rgb(var(--border-rgb))',
  '--xy-edge-label-color-props': 'rgb(var(--text-rgb))',
  '--xy-edge-label-background-color-props': 'rgb(var(--surface-rgb))',
  '--xy-selection-background-color-props': 'rgb(var(--primary-rgb) / 0.08)',
  '--xy-selection-border-props': '1px dotted rgb(var(--primary-rgb))',
} as CSSProperties;

const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  return Boolean(el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)));
};

interface Props {
  editor: WorkflowEditor;
  readOnly: boolean;
  issueByNode: Record<string, 'error' | 'warning'>;
  runByNode: Record<string, RunOverlay>;
  /** Node to centre on (set by "Show node" in the validation panel). */
  focusId: string | null;
  onFocused: () => void;
  onRequestDelete: () => void;
  /** The inspector lives in a sheet (below the desktop breakpoint): node taps open it. */
  sheetInspector: boolean;
  onEditNode: () => void;
}

export function BuilderCanvas({ editor, readOnly, issueByNode, runByNode, focusId, onFocused, onRequestDelete, sheetInspector, onEditNode }: Props) {
  const rf = useReactFlow();
  const wrapper = useRef<HTMLDivElement>(null);
  const [snap, setSnap] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const hasTrigger = editor.nodes.some((n) => n.data.kind === 'trigger');
  const hasSelection = editor.selectedNodes.length + editor.selectedEdges.length > 0;

  const nodes = useMemo(
    () => editor.nodes.map((n) => (runByNode[n.id] || issueByNode[n.id] ? { ...n, data: { ...n.data, run: runByNode[n.id], issue: issueByNode[n.id] } } : n)),
    [editor.nodes, runByNode, issueByNode],
  );

  useEffect(() => {
    if (!focusId) return;
    const t = setTimeout(() => {
      void rf.fitView({ nodes: [{ id: focusId }], maxZoom: 1.1, padding: 0.8, duration: reduceMotion ? 0 : 250 });
      onFocused();
    }, 50);
    return () => clearTimeout(t);
  }, [focusId, rf, reduceMotion, onFocused]);

  function addAtCentre(kind: NodeKind) {
    const rect = wrapper.current?.getBoundingClientRect();
    const centre = rect ? rf.screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }) : { x: 0, y: 0 };
    const result = editor.addNode(kind, { x: centre.x - 110, y: centre.y - 40 });
    if (!result.ok) toast.error(result.reason);
    else toast.success(`${DEFAULT_LABELS[kind]} added`, { description: 'Selected on the canvas. Connect it from its handles or the Outline tab.' });
    setPaletteOpen(false);
  }

  function onDrop(e: DragEvent) {
    const kind = e.dataTransfer.getData(DRAG_MIME) as NodeKind;
    if (!kind) return;
    e.preventDefault();
    const at = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const result = editor.addNode(kind, { x: at.x - 110, y: at.y - 40 });
    if (!result.ok) toast.error(result.reason);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (isTyping(e.target) || readOnly) return;
    const el = (e.target as HTMLElement).closest?.('.react-flow__node, .react-flow__edge') as HTMLElement | null;
    const id = el?.getAttribute('data-id');
    if ((e.key === 'Enter' || e.key === ' ') && el && id) {
      e.preventDefault();
      if (el.classList.contains('react-flow__edge')) editor.select([], [id]);
      else editor.select([id]);
    } else if (e.key.startsWith('Arrow') && editor.selectedNodes.length > 0) {
      e.preventDefault();
      const step = e.shiftKey ? 48 : snap ? 16 : 8;
      editor.moveSelected(e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0, e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0);
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && hasSelection) {
      e.preventDefault();
      onRequestDelete();
    } else if (e.key === 'Escape') editor.select([]);
  }

  const tool = 'bg-surface/95 shadow-card';
  return (
    <div className="grid gap-3 md:grid-cols-[12.5rem_minmax(0,1fr)]">
      {!readOnly && !isMobile && <aside className="max-h-[70dvh] overflow-y-auto pr-1 custom-scrollbar"><NodePalette onAdd={addAtCentre} disabledKinds={hasTrigger ? ['trigger'] : []} /></aside>}
      <div
        ref={wrapper}
        role="application"
        aria-label="Workflow canvas"
        aria-describedby="canvas-help"
        onKeyDown={onKeyDown}
        className="relative h-[70dvh] min-h-[26rem] overflow-hidden rounded-card border border-border bg-canvas"
      >
        <p id="canvas-help" className="sr-only">
          Tab to a node and press Enter to select it. Arrow keys move selected nodes, Delete removes them, Control or Command plus Z undoes. For a list view with connection controls, open the Outline tab.
        </p>
        <ReactFlow
          nodes={nodes}
          edges={editor.edges}
          nodeTypes={nodeTypes}
          onNodesChange={editor.onNodesChange}
          onEdgesChange={editor.onEdgesChange}
          onConnect={(c: FlowConnection) => {
            const result = editor.connect({ source: c.source, target: c.target, sourceHandle: c.sourceHandle });
            if (!result.ok) toast.error(result.reason);
          }}
          isValidConnection={(c) => canConnect(editor.graph, { source: c.source, target: c.target, sourceHandle: c.sourceHandle ?? null }).ok}
          onNodeDragStart={editor.onDragStart}
          onNodeClick={(_, node) => { if (sheetInspector) { editor.select([node.id]); onEditNode(); } }}
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
          onDrop={onDrop}
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          snapToGrid={snap}
          snapGrid={[16, 16]}
          deleteKeyCode={null}
          disableKeyboardA11y
          connectionRadius={28}
          fitView
          fitViewOptions={{ padding: 0.08, maxZoom: 1 }}
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          style={FLOW_THEME}
          aria-label="Workflow graph"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} />
          <Controls showInteractive={false} position="bottom-left" />
          {!isMobile && <MiniMap pannable zoomable ariaLabel="Workflow minimap" nodeColor="rgb(var(--text-muted-rgb) / 0.6)" nodeStrokeColor="rgb(var(--border-rgb))" />}
          <Panel position="top-left" className="flex flex-wrap items-center gap-1.5">
            {!readOnly && (
              <>
                <Button size="icon" variant="secondary" className={tool} aria-label="Undo" title="Undo (Ctrl+Z)" disabled={!editor.canUndo} onClick={editor.undo}><IconRenderer name="Undo2" className="size-4" /></Button>
                <Button size="icon" variant="secondary" className={tool} aria-label="Redo" title="Redo (Ctrl+Shift+Z)" disabled={!editor.canRedo} onClick={editor.redo}><IconRenderer name="Redo2" className="size-4" /></Button>
                <Button size="icon" variant="secondary" className={tool} aria-label="Delete selected" title="Delete selected (Delete)" disabled={!hasSelection} onClick={onRequestDelete}><IconRenderer name="Trash2" className="size-4" /></Button>
                <Button size="icon" variant="secondary" className={tool} aria-label="Auto layout" title="Auto layout" onClick={() => { editor.layout(); void rf.fitView({ padding: 0.08, maxZoom: 1, duration: reduceMotion ? 0 : 250 }); }}><IconRenderer name="Layout" className="size-4" /></Button>
              </>
            )}
            <Button size="icon" variant="secondary" className={tool} aria-label="Fit view" title="Fit view" onClick={() => void rf.fitView({ padding: 0.08, maxZoom: 1, duration: reduceMotion ? 0 : 250 })}><IconRenderer name="Maximize2" className="size-4" /></Button>
            <span className={`flex items-center gap-2 rounded-button border border-border px-2 py-1 ${tool}`}>
              <Switch id="snap-grid" checked={snap} onCheckedChange={setSnap} />
              <Label htmlFor="snap-grid" className="text-xs">Snap to grid</Label>
            </span>
          </Panel>
          <Panel position="bottom-right" className="flex gap-2">
            {isMobile && !readOnly && <Button onClick={() => setPaletteOpen(true)}><IconRenderer name="Plus" className="size-4" /> Add node</Button>}
            {sheetInspector && editor.selectedNodes.length === 1 && <Button variant="secondary" onClick={onEditNode}><IconRenderer name="Sliders" className="size-4" /> Edit node</Button>}
          </Panel>
        </ReactFlow>
      </div>

      <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
        <SheetContent side="bottom">
          <SheetHeader><SheetTitle>Add a node</SheetTitle><SheetDescription>The node is placed in the middle of the canvas.</SheetDescription></SheetHeader>
          <SheetBody><NodePalette onAdd={addAtCentre} disabledKinds={hasTrigger ? ['trigger'] : []} /></SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}
