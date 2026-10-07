import { describe, expect, it } from 'vitest';
import { autoLayout, canConnect, extractVariables, findCycles, hasErrors, NODE_HEIGHT, NODE_WIDTH, validateGraph } from './graph';
import { NODE_CATALOG } from './node-catalog';
import { simulateRun } from './simulate';
import { templateGraph, TEMPLATES } from './templates';
import { TEMPLATE_IDS } from './schemas';
import type { NodeKind, WorkflowGraph, WorkflowNode } from './types';

const n = (id: string, type: NodeKind, config: Record<string, unknown> = {}): WorkflowNode => ({ id, type, label: id, position: { x: 0, y: 0 }, config: { ...NODE_CATALOG[type].defaultConfig, ...config } });
const e = (source: string, target: string, sourceHandle: string | null = null) => ({ id: `${source}-${target}-${sourceHandle}`, source, target, sourceHandle });
const messages = (g: WorkflowGraph, severity?: 'error' | 'warning') => validateGraph(g).filter((i) => !severity || i.severity === severity).map((i) => i.message);

describe('validateGraph', () => {
  it('accepts every shipped template without errors', () => {
    for (const id of TEMPLATE_IDS) expect(hasErrors(validateGraph(templateGraph(id))), id).toBe(false);
    expect(TEMPLATES.map((t) => t.id)).toEqual([...TEMPLATE_IDS]);
  });

  it('requires exactly one trigger', () => {
    expect(messages({ nodes: [n('o', 'output')], edges: [] }, 'error')).toEqual(['Add a trigger. Every workflow needs exactly one.']);
    const two = { nodes: [n('t1', 'trigger'), n('t2', 'trigger'), n('o', 'output')], edges: [e('t1', 'o')] };
    expect(validateGraph(two).filter((i) => i.severity === 'error' && /Only one trigger/.test(i.message))).toHaveLength(2);
  });

  it('rejects incoming edges on triggers and outgoing edges on outputs', () => {
    const g = { nodes: [n('t', 'trigger'), n('o', 'output'), n('l', 'transform')], edges: [e('l', 't'), e('o', 'l')] };
    const errors = messages(g, 'error').join(' | ');
    expect(errors).toMatch(/trigger and cannot have incoming/);
    expect(errors).toMatch(/output and cannot have outgoing/);
  });

  it('flags cycles unless a loop is part of them', () => {
    const bad = { nodes: [n('t', 'trigger'), n('a', 'transform'), n('b', 'transform'), n('o', 'output')], edges: [e('t', 'a'), e('a', 'b'), e('b', 'a'), e('b', 'o')] };
    expect(messages(bad, 'error').filter((m) => /cycle/.test(m))).toHaveLength(2);
    const ok = { nodes: [n('t', 'trigger'), n('l', 'loop'), n('b', 'transform'), n('o', 'output')], edges: [e('t', 'l'), e('l', 'b'), e('b', 'l'), e('l', 'o')] };
    expect(messages(ok, 'error').filter((m) => /cycle/.test(m))).toEqual([]);
    expect(findCycles(ok)).toHaveLength(1);
    expect(findCycles({ nodes: [n('a', 'transform')], edges: [e('a', 'a')] })).toEqual([['a']]);
  });

  it('warns about orphans, dead ends and missing condition branches', () => {
    const g = { nodes: [n('t', 'trigger'), n('c', 'condition'), n('o', 'output'), n('x', 'transform')], edges: [e('t', 'c'), e('c', 'o', 'true')] };
    const warnings = messages(g, 'warning').join(' | ');
    expect(warnings).toMatch(/"x" is not connected to the trigger/);
    expect(warnings).toMatch(/"c" has no step on its false branch/);
    expect(warnings).toMatch(/"x" has nothing connected after it/);
    expect(hasErrors(validateGraph(g))).toBe(false);
  });

  it('reports invalid node configuration, including non-https URLs', () => {
    const g = { nodes: [n('t', 'trigger'), n('h', 'http', { url: 'http://insecure.example.com' }), n('m', 'llm', { modelId: '' }), n('o', 'output')], edges: [e('t', 'h'), e('h', 'm'), e('m', 'o')] };
    const errors = messages(g, 'error');
    expect(errors.some((m) => /"h" needs attention.*https/.test(m))).toBe(true);
    expect(errors.some((m) => /"m" needs attention.*Select a model/.test(m))).toBe(true);
    expect(validateGraph(g).find((i) => i.nodeId === 'h')).toBeTruthy();
  });

  it('requires an event name for event triggers', () => {
    const g = { nodes: [n('t', 'trigger', { triggerType: 'event', eventName: '' }), n('o', 'output')], edges: [e('t', 'o')] };
    expect(messages(g, 'error').join()).toMatch(/Choose the event/);
  });
});

describe('canConnect', () => {
  const base: WorkflowGraph = { nodes: [n('t', 'trigger'), n('a', 'transform'), n('b', 'transform'), n('c', 'condition'), n('o', 'output'), n('l', 'loop')], edges: [e('t', 'a'), e('a', 'b')] };

  it('allows a normal forward connection', () => {
    expect(canConnect(base, { source: 'b', target: 'o' })).toEqual({ ok: true });
  });
  it.each([
    [{ source: 'a', target: 'a' }, /itself/],
    [{ source: 'o', target: 'a' }, /Output nodes/],
    [{ source: 'a', target: 't' }, /Triggers cannot/],
    [{ source: 'a', target: 'b' }, /already connected/],
    [{ source: 'c', target: 'o' }, /true or false/],
    [{ source: 'a', target: 'o', sourceHandle: 'true' }, /Only conditions/],
    [{ source: 'b', target: 'a' }, /cycle/],
    [{ source: 'x', target: 'a' }, /must exist/],
  ])('rejects %j', (conn, reason) => {
    const result = canConnect(base, conn);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(reason);
  });
  it('allows a cycle that goes through a loop', () => {
    const g: WorkflowGraph = { nodes: base.nodes, edges: [e('t', 'l'), e('l', 'a'), e('a', 'b')] };
    expect(canConnect(g, { source: 'b', target: 'l' })).toEqual({ ok: true });
  });
});

describe('autoLayout', () => {
  it('places nodes in left-to-right layers without overlap and is pure', () => {
    const g = templateGraph('support-triage');
    const before = JSON.stringify(g);
    const out = autoLayout(g);
    expect(JSON.stringify(g)).toBe(before);
    const pos = Object.fromEntries(out.nodes.map((x) => [x.id, x.position]));
    expect(pos.trigger.x).toBeLessThan(pos.classify.x);
    expect(pos.classify.x).toBeLessThan(pos.urgent.x);
    expect(pos.urgent.x).toBeLessThan(pos.slack.x);
    expect(pos.slack.x).toBe(pos.draft.x);
    expect(pos.slack.y).not.toBe(pos.draft.y);
    expect(Math.abs(pos.slack.y - pos.draft.y)).toBeGreaterThanOrEqual(NODE_HEIGHT);
    for (const a of out.nodes) for (const b of out.nodes) if (a.id < b.id) {
      const overlapX = Math.abs(a.position.x - b.position.x) < NODE_WIDTH;
      const overlapY = Math.abs(a.position.y - b.position.y) < NODE_HEIGHT;
      expect(overlapX && overlapY, `${a.id} overlaps ${b.id}`).toBe(false);
    }
  });

  it('terminates on loops and keeps unconnected nodes', () => {
    const g: WorkflowGraph = { nodes: [n('t', 'trigger'), n('l', 'loop'), n('b', 'transform'), n('free', 'notify')], edges: [e('t', 'l'), e('l', 'b'), e('b', 'l')] };
    const out = autoLayout(g);
    expect(out.nodes).toHaveLength(4);
    expect(out.nodes.find((x) => x.id === 'l')?.position.x).toBeGreaterThan(out.nodes.find((x) => x.id === 't')?.position.x ?? 0);
    expect(out.nodes.find((x) => x.id === 'free')?.position.x).toBe(0);
  });

  it('handles an empty graph', () => {
    expect(autoLayout({ nodes: [], edges: [] })).toEqual({ nodes: [], edges: [] });
  });
});

describe('simulateRun', () => {
  it('walks a valid graph deterministically and reports per-node results', () => {
    const g = templateGraph('rag-qa');
    const a = simulateRun(g);
    expect(a).toEqual(simulateRun(g));
    expect(a.status).toBe('succeeded');
    expect(a.steps.map((s) => s.nodeId)).toEqual(['trigger', 'retrieve', 'answer', 'out']);
    expect(a.tokens).toBeGreaterThan(0);
  });
  it('takes one branch of a condition and marks the other path skipped', () => {
    const run = simulateRun(templateGraph('support-triage'));
    expect(run.steps.filter((s) => s.status === 'skipped').length).toBeGreaterThanOrEqual(2);
  });
  it('stops at a human approval', () => {
    const g: WorkflowGraph = { nodes: [n('t', 'trigger'), n('a', 'approval'), n('o', 'output')], edges: [e('t', 'a'), e('a', 'o')] };
    const run = simulateRun(g);
    expect(run.status).toBe('awaiting-approval');
    expect(run.steps.at(-1)?.status).toBe('skipped');
  });
  it('fails without a trigger', () => {
    expect(simulateRun({ nodes: [n('o', 'output')], edges: [] }).status).toBe('failed');
  });
});

describe('extractVariables', () => {
  it('lists unique template variables', () => {
    expect(extractVariables('Hi {{ name }}, {{ticket.body}} and {{name}} {not}')).toEqual(['name', 'ticket.body']);
  });
});
