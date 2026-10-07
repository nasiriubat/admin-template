'use client';

import { applyEdgeChanges, applyNodeChanges, MarkerType, type Edge, type EdgeChange, type Node, type NodeChange } from '@xyflow/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { autoLayout, canConnect, edgeId, NODE_HEIGHT, newNodeId, type Connection } from './graph';
import { DEFAULT_LABELS, NODE_CATALOG } from './node-catalog';
import type { NodeKind, WorkflowEdge, WorkflowGraph, WorkflowNode } from './types';

export interface RunOverlay {
  status: 'succeeded' | 'failed' | 'skipped' | 'waiting';
  durationMs: number;
  tokens: number;
}

export interface FlowNodeData extends Record<string, unknown> {
  kind: NodeKind;
  label: string;
  config: Record<string, unknown>;
  run?: RunOverlay;
  issue?: 'error' | 'warning';
}

export type FlowNode = Node<FlowNodeData, 'wf'>;
export type EditResult = { ok: true; id?: string } | { ok: false; reason: string };

const HISTORY_LIMIT = 100;
const COALESCE_MS = 1000;

export const toFlowNode = (n: WorkflowNode): FlowNode => ({
  id: n.id,
  type: 'wf',
  position: n.position,
  ariaLabel: `${n.label}, ${DEFAULT_LABELS[n.type]} node`,
  data: { kind: n.type, label: n.label, config: n.config },
});

export const toFlowEdge = (e: WorkflowEdge): Edge => ({
  id: e.id,
  source: e.source,
  target: e.target,
  sourceHandle: e.sourceHandle,
  label: e.sourceHandle ?? undefined,
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed },
  ariaLabel: `Connection from ${e.source} to ${e.target}`,
});

export const flowToGraph = (nodes: FlowNode[], edges: Edge[]): WorkflowGraph => ({
  nodes: nodes.map((n) => ({ id: n.id, type: n.data.kind, label: n.data.label, position: { x: Math.round(n.position.x), y: Math.round(n.position.y) }, config: n.data.config })),
  edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle ?? null })),
});

/**
 * Owns the editable graph (React Flow format), selection and an undo/redo stack of graph snapshots.
 * Every mutation pushes the pre-change snapshot first; rapid edits with the same `coalesce` key
 * (typing in an inspector field, arrow-key nudging) share one history entry.
 */
export function useWorkflowEditor(initial: WorkflowGraph, readOnly: boolean) {
  const [nodes, setNodes] = useState<FlowNode[]>(() => initial.nodes.map(toFlowNode));
  const [edges, setEdges] = useState<Edge[]>(() => initial.edges.map(toFlowEdge));
  const [revision, setRevision] = useState(0);
  const [historyTick, setHistoryTick] = useState(0);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;
  const past = useRef<WorkflowGraph[]>([]);
  const future = useRef<WorkflowGraph[]>([]);
  const last = useRef<{ key: string | null; at: number }>({ key: null, at: 0 });
  const spawned = useRef(0);

  const graph = useMemo(() => flowToGraph(nodes, edges), [nodes, edges]);
  const graphRef = useRef(graph);
  graphRef.current = graph;

  const snapshot = useCallback(() => flowToGraph(nodesRef.current, edgesRef.current), []);

  const push = useCallback((coalesce?: string) => {
    const now = Date.now();
    if (coalesce && last.current.key === coalesce && now - last.current.at < COALESCE_MS) {
      last.current.at = now;
      return;
    }
    past.current = [...past.current.slice(-(HISTORY_LIMIT - 1)), snapshot()];
    future.current = [];
    last.current = { key: coalesce ?? null, at: now };
    setHistoryTick((t) => t + 1);
  }, [snapshot]);

  const apply = useCallback((g: WorkflowGraph) => {
    setNodes(g.nodes.map(toFlowNode));
    setEdges(g.edges.map(toFlowEdge));
    setRevision((r) => r + 1);
  }, []);

  const undo = useCallback(() => {
    const previous = past.current.pop();
    if (!previous) return;
    future.current.push(snapshot());
    last.current = { key: null, at: 0 };
    apply(previous);
    setHistoryTick((t) => t + 1);
  }, [apply, snapshot]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(snapshot());
    last.current = { key: null, at: 0 };
    apply(next);
    setHistoryTick((t) => t + 1);
  }, [apply, snapshot]);

  const onNodesChange = useCallback((changes: NodeChange<FlowNode>[]) => {
    const allowed = changes.filter((c) => c.type !== 'remove' && !(readOnly && (c.type === 'position' || c.type === 'add' || c.type === 'replace')));
    if (allowed.length) setNodes((current) => applyNodeChanges(allowed, current));
  }, [readOnly]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    const allowed = changes.filter((c) => c.type !== 'remove');
    if (allowed.length) setEdges((current) => applyEdgeChanges(allowed, current));
  }, []);

  const select = useCallback((nodeIds: string[], edgeIds: string[] = []) => {
    setNodes((cur) => cur.map((n) => (n.selected === nodeIds.includes(n.id) ? n : { ...n, selected: nodeIds.includes(n.id) })));
    setEdges((cur) => cur.map((e) => (e.selected === edgeIds.includes(e.id) ? e : { ...e, selected: edgeIds.includes(e.id) })));
  }, []);

  const connect = useCallback((c: Connection): EditResult => {
    if (readOnly) return { ok: false, reason: 'You have view-only access.' };
    const verdict = canConnect(graphRef.current, c);
    if (!verdict.ok) return verdict;
    push();
    const handle = c.sourceHandle ?? null;
    setEdges((cur) => [...cur.map((e) => (e.selected ? { ...e, selected: false } : e)), toFlowEdge({ id: edgeId(c), source: c.source, target: c.target, sourceHandle: handle })]);
    return { ok: true };
  }, [push, readOnly]);

  const addNode = useCallback((kind: NodeKind, position?: { x: number; y: number }): EditResult => {
    if (readOnly) return { ok: false, reason: 'You have view-only access.' };
    if (kind === 'trigger' && nodesRef.current.some((n) => n.data.kind === 'trigger')) return { ok: false, reason: 'A workflow can have only one trigger.' };
    push();
    const current = nodesRef.current;
    const id = newNodeId(kind, current.map((n) => n.id));
    const maxY = current.reduce((m, n) => Math.max(m, n.position.y), -NODE_HEIGHT - 40);
    spawned.current += 1;
    const at = position ? { x: position.x + (spawned.current % 5) * 14, y: position.y + (spawned.current % 5) * 14 } : { x: 0, y: maxY + NODE_HEIGHT + 40 };
    const node = toFlowNode({ id, type: kind, label: DEFAULT_LABELS[kind], position: at, config: structuredClone(NODE_CATALOG[kind].defaultConfig) });
    setNodes((cur) => [...cur.map((n) => (n.selected ? { ...n, selected: false } : n)), { ...node, selected: true }]);
    return { ok: true, id };
  }, [push, readOnly]);

  const updateNode = useCallback((id: string, patch: { label?: string; config?: Record<string, unknown> }, coalesce = `edit:${id}`) => {
    if (readOnly) return;
    push(coalesce);
    setNodes((cur) => cur.map((n) => (n.id === id ? { ...n, ariaLabel: `${patch.label ?? n.data.label}, ${DEFAULT_LABELS[n.data.kind]} node`, data: { ...n.data, label: patch.label ?? n.data.label, config: patch.config ?? n.data.config } } : n)));
  }, [push, readOnly]);

  const remove = useCallback((nodeIds: string[], edgeIds: string[] = []) => {
    if (readOnly || (nodeIds.length === 0 && edgeIds.length === 0)) return;
    push();
    const gone = new Set(nodeIds);
    setNodes((cur) => cur.filter((n) => !gone.has(n.id)));
    setEdges((cur) => cur.filter((e) => !gone.has(e.source) && !gone.has(e.target) && !edgeIds.includes(e.id)));
  }, [push, readOnly]);

  const moveSelected = useCallback((dx: number, dy: number) => {
    if (readOnly || !nodesRef.current.some((n) => n.selected)) return;
    push('move');
    setNodes((cur) => cur.map((n) => (n.selected ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } } : n)));
  }, [push, readOnly]);

  const layout = useCallback(() => {
    if (readOnly) return;
    push();
    const arranged = autoLayout(snapshot());
    const at = new Map(arranged.nodes.map((n) => [n.id, n.position]));
    setNodes((cur) => cur.map((n) => ({ ...n, position: at.get(n.id) ?? n.position })));
  }, [push, readOnly, snapshot]);

  /** Replace the whole graph (import, restore). `keepHistory` makes it undoable. */
  const replace = useCallback((g: WorkflowGraph, keepHistory = true) => {
    if (keepHistory) push();
    else {
      past.current = [];
      future.current = [];
      setHistoryTick((t) => t + 1);
    }
    apply(g);
  }, [apply, push]);

  const selectedNodes = useMemo(() => nodes.filter((n) => n.selected), [nodes]);
  const selectedEdges = useMemo(() => edges.filter((e) => e.selected), [edges]);

  return {
    nodes, edges, graph, revision, selectedNodes, selectedEdges,
    canUndo: past.current.length > 0, canRedo: future.current.length > 0, historyTick,
    onNodesChange, onEdgesChange, onDragStart: () => push(), select, connect, addNode, updateNode, remove, moveSelected, layout, replace, undo, redo,
  };
}

export type WorkflowEditor = ReturnType<typeof useWorkflowEditor>;
