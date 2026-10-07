import { configSchemas } from './schemas';
import { NODE_CATALOG } from './node-catalog';
import type { NodeKind, WorkflowEdge, WorkflowGraph, WorkflowNode } from './types';

export type IssueSeverity = 'error' | 'warning';

export interface GraphIssue {
  id: string;
  severity: IssueSeverity;
  message: string;
  nodeId?: string;
}

export interface Connection {
  source: string;
  target: string;
  sourceHandle?: string | null;
}

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 84;

const nodeById = (graph: WorkflowGraph) => new Map(graph.nodes.map((n) => [n.id, n]));

function adjacency(graph: WorkflowGraph): Map<string, string[]> {
  const map = new Map<string, string[]>(graph.nodes.map((n) => [n.id, []]));
  for (const e of graph.edges) map.get(e.source)?.push(e.target);
  return map;
}

function reachableFrom(start: string, adj: Map<string, string[]>): Set<string> {
  const seen = new Set<string>();
  const stack = [start];
  while (stack.length) {
    const id = stack.pop() as string;
    for (const next of adj.get(id) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return seen;
}

/** Strongly connected components with more than one node, or a node with a self edge (Tarjan). */
export function findCycles(graph: WorkflowGraph): string[][] {
  const adj = adjacency(graph);
  let counter = 0;
  const index = new Map<string, number>();
  const low = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const cycles: string[][] = [];

  const visit = (v: string) => {
    index.set(v, counter);
    low.set(v, counter);
    counter += 1;
    stack.push(v);
    onStack.add(v);
    for (const w of adj.get(v) ?? []) {
      if (!index.has(w)) {
        visit(w);
        low.set(v, Math.min(low.get(v) as number, low.get(w) as number));
      } else if (onStack.has(w)) {
        low.set(v, Math.min(low.get(v) as number, index.get(w) as number));
      }
    }
    if (low.get(v) === index.get(v)) {
      const component: string[] = [];
      let w: string;
      do {
        w = stack.pop() as string;
        onStack.delete(w);
        component.push(w);
      } while (w !== v);
      if (component.length > 1 || (adj.get(v) ?? []).includes(v)) cycles.push(component);
    }
  };
  for (const n of graph.nodes) if (!index.has(n.id)) visit(n.id);
  return cycles;
}

/** Whether a new connection would be legal, with a human reason when it is not. */
export function canConnect(graph: WorkflowGraph, c: Connection): { ok: true } | { ok: false; reason: string } {
  const nodes = nodeById(graph);
  const source = nodes.get(c.source);
  const target = nodes.get(c.target);
  if (!source || !target) return { ok: false, reason: 'Both ends of a connection must exist.' };
  if (source.id === target.id) return { ok: false, reason: 'A node cannot connect to itself.' };
  if (!NODE_CATALOG[source.type].hasOutput) return { ok: false, reason: 'Output nodes have no outgoing connections.' };
  if (!NODE_CATALOG[target.type].hasInput) return { ok: false, reason: 'Triggers cannot have incoming connections.' };
  const handle = c.sourceHandle ?? null;
  if (source.type === 'condition' && handle !== 'true' && handle !== 'false') return { ok: false, reason: 'Choose the true or false branch of the condition.' };
  if (source.type !== 'condition' && handle !== null) return { ok: false, reason: 'Only conditions have named branches.' };
  if (graph.edges.some((e) => e.source === c.source && e.target === c.target && (e.sourceHandle ?? null) === handle)) {
    return { ok: false, reason: 'These nodes are already connected.' };
  }
  // A cycle is only legal when it passes through a Loop node.
  const adj = adjacency(graph);
  const downstream = reachableFrom(target.id, adj);
  if (downstream.has(source.id)) {
    const reverse = new Map<string, string[]>(graph.nodes.map((n) => [n.id, []]));
    for (const e of graph.edges) reverse.get(e.target)?.push(e.source);
    const upstream = reachableFrom(source.id, reverse);
    const inCycle = [source.id, target.id, ...[...downstream].filter((id) => upstream.has(id))];
    if (!inCycle.some((id) => nodes.get(id)?.type === 'loop')) return { ok: false, reason: 'This would create a cycle. Only Loop nodes can repeat.' };
  }
  return { ok: true };
}

const label = (n: WorkflowNode) => `"${n.label}"`;

/** Structural and per-node configuration checks. Errors block activation; warnings do not. */
export function validateGraph(graph: WorkflowGraph): GraphIssue[] {
  const issues: GraphIssue[] = [];
  let seq = 0;
  const add = (severity: IssueSeverity, message: string, nodeId?: string) => issues.push({ id: `issue-${seq++}`, severity, message, nodeId });
  const nodes = nodeById(graph);
  const incoming = new Map<string, WorkflowEdge[]>();
  const outgoing = new Map<string, WorkflowEdge[]>();
  for (const e of graph.edges) {
    if (!nodes.has(e.source) || !nodes.has(e.target)) {
      add('error', 'A connection points at a node that no longer exists.');
      continue;
    }
    incoming.set(e.target, [...(incoming.get(e.target) ?? []), e]);
    outgoing.set(e.source, [...(outgoing.get(e.source) ?? []), e]);
  }

  const triggers = graph.nodes.filter((n) => n.type === 'trigger');
  if (triggers.length === 0) add('error', 'Add a trigger. Every workflow needs exactly one.');
  if (triggers.length > 1) for (const t of triggers) add('error', `Only one trigger is allowed; remove ${label(t)} or the others.`, t.id);
  if (!graph.nodes.some((n) => n.type === 'output')) add('warning', 'Add an Output node so the workflow returns a result.');

  for (const n of graph.nodes) {
    const spec = NODE_CATALOG[n.type];
    const parsed = configSchemas[n.type].safeParse(n.config);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const field = first.path.length ? `${String(first.path[0])}: ` : '';
      add('error', `${label(n)} needs attention. ${field}${first.message}`, n.id);
    }
    if (n.type === 'trigger' && (incoming.get(n.id)?.length ?? 0) > 0) add('error', `${label(n)} is a trigger and cannot have incoming connections.`, n.id);
    if (n.type === 'output' && (outgoing.get(n.id)?.length ?? 0) > 0) add('error', `${label(n)} is an output and cannot have outgoing connections.`, n.id);
    if (spec.hasOutput && (outgoing.get(n.id)?.length ?? 0) === 0 && n.type !== 'output') add('warning', `${label(n)} has nothing connected after it.`, n.id);
    if (n.type === 'condition') {
      const handles = new Set((outgoing.get(n.id) ?? []).map((e) => e.sourceHandle));
      for (const branch of ['true', 'false']) if (!handles.has(branch)) add('warning', `${label(n)} has no step on its ${branch} branch.`, n.id);
    }
  }

  for (const cycle of findCycles(graph)) {
    if (!cycle.some((id) => nodes.get(id)?.type === 'loop')) {
      for (const id of cycle) add('error', `${label(nodes.get(id) as WorkflowNode)} is part of a cycle. Only Loop nodes can repeat.`, id);
    }
  }

  if (triggers.length === 1) {
    const reached = reachableFrom(triggers[0].id, adjacency(graph));
    for (const n of graph.nodes) {
      if (n.type !== 'trigger' && !reached.has(n.id)) add('warning', `${label(n)} is not connected to the trigger and will never run.`, n.id);
    }
  }
  return issues;
}

export const hasErrors = (issues: GraphIssue[]) => issues.some((i) => i.severity === 'error');

/** Variables referenced as `{{name}}` in a template, in order of first appearance. */
export function extractVariables(template: string): string[] {
  const found: string[] = [];
  for (const match of template.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)) if (!found.includes(match[1])) found.push(match[1]);
  return found;
}

export interface LayoutOptions {
  gapX?: number;
  gapY?: number;
}

/**
 * Simple layered (left to right) layout. Back edges (loops) are ignored for ranking, a node's layer
 * is its longest path from a root, and nodes inside a layer are ordered by the average position
 * of their predecessors to limit crossings. Pure: returns a new graph.
 */
export function autoLayout(graph: WorkflowGraph, { gapX = 90, gapY = 40 }: LayoutOptions = {}): WorkflowGraph {
  const ids = graph.nodes.map((n) => n.id);
  const known = new Set(ids);
  const edges = graph.edges.filter((e) => known.has(e.source) && known.has(e.target) && e.source !== e.target);
  const out = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const e of edges) out.get(e.source)?.push(e.target);

  // Find back edges with a DFS starting at roots (nodes without incoming edges), then any leftovers.
  const hasIncoming = new Set(edges.map((e) => e.target));
  const roots = [...ids.filter((id) => !hasIncoming.has(id)), ...ids];
  const state = new Map<string, 'open' | 'done'>();
  const back = new Set<string>();
  const dfs = (v: string) => {
    state.set(v, 'open');
    for (const w of out.get(v) ?? []) {
      if (state.get(w) === 'open') back.add(`${v}>${w}`);
      else if (!state.has(w)) dfs(w);
    }
    state.set(v, 'done');
  };
  for (const r of roots) if (!state.has(r)) dfs(r);

  const forward = edges.filter((e) => !back.has(`${e.source}>${e.target}`));
  const preds = new Map<string, string[]>(ids.map((id) => [id, []]));
  const indegree = new Map<string, number>(ids.map((id) => [id, 0]));
  for (const e of forward) {
    preds.get(e.target)?.push(e.source);
    indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1);
  }
  const layer = new Map<string, number>(ids.map((id) => [id, 0]));
  const queue = ids.filter((id) => indegree.get(id) === 0);
  while (queue.length) {
    const v = queue.shift() as string;
    for (const e of forward.filter((x) => x.source === v)) {
      layer.set(e.target, Math.max(layer.get(e.target) as number, (layer.get(v) as number) + 1));
      indegree.set(e.target, (indegree.get(e.target) as number) - 1);
      if (indegree.get(e.target) === 0) queue.push(e.target);
    }
  }

  const byLayer = new Map<number, string[]>();
  for (const id of ids) byLayer.set(layer.get(id) as number, [...(byLayer.get(layer.get(id) as number) ?? []), id]);
  const row = new Map<string, number>();
  const maxLayer = Math.max(0, ...byLayer.keys());
  const maxRows = Math.max(1, ...[...byLayer.values()].map((l) => l.length));
  const positions = new Map<string, { x: number; y: number }>();
  for (let l = 0; l <= maxLayer; l += 1) {
    const members = byLayer.get(l) ?? [];
    const score = (id: string) => {
      const p = (preds.get(id) ?? []).map((x) => row.get(x) ?? 0);
      return p.length ? p.reduce((a, b) => a + b, 0) / p.length : ids.indexOf(id);
    };
    const ordered = [...members].sort((a, b) => score(a) - score(b) || ids.indexOf(a) - ids.indexOf(b));
    const offset = ((maxRows - ordered.length) * (NODE_HEIGHT + gapY)) / 2;
    ordered.forEach((id, i) => {
      row.set(id, i + (maxRows - ordered.length) / 2);
      positions.set(id, { x: l * (NODE_WIDTH + gapX), y: offset + i * (NODE_HEIGHT + gapY) });
    });
  }
  return { nodes: graph.nodes.map((n) => ({ ...n, position: positions.get(n.id) ?? n.position })), edges: graph.edges };
}

let idCounter = 0;
/** Unique-enough id for nodes created in the browser; the server may re-key on save. */
export function newNodeId(kind: NodeKind, existing: Iterable<string> = []): string {
  const taken = new Set(existing);
  let id: string;
  do {
    idCounter += 1;
    id = `${kind}-${Date.now().toString(36)}${idCounter.toString(36)}`;
  } while (taken.has(id));
  return id;
}

export const edgeId = (c: Connection) => `e-${c.source}-${c.sourceHandle ?? 'out'}-${c.target}`;
