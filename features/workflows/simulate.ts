import { NODE_CATALOG } from './node-catalog';
import type { NodeKind, RunStatus, RunStep, WorkflowGraph } from './types';

export interface SimulatedRun {
  status: RunStatus;
  durationMs: number;
  tokens: number;
  costUsd: number;
  error: string | null;
  steps: RunStep[];
}

/** Stable pseudo-random number in [0, 1) from a string, so the same graph always simulates the same way. */
function hash01(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) h = Math.imul(h ^ input.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10_000) / 10_000;
}

const DURATION: Record<NodeKind, [number, number]> = {
  trigger: [4, 20], llm: [700, 2600], retrieval: [120, 480], http: [90, 900], transform: [3, 25], condition: [2, 12], loop: [20, 120], approval: [0, 0], notify: [60, 320], output: [2, 10],
};

function sampleOutput(kind: NodeKind, config: Record<string, unknown>, branch?: string): unknown {
  switch (kind) {
    case 'trigger': return { triggeredBy: config.triggerType, payload: { sample: true } };
    case 'llm': return { text: 'Simulated response. No model was called during this test run.', model: config.modelId };
    case 'retrieval': return { passages: [{ title: 'Refund policy', score: 0.91 }, { title: 'Getting started', score: 0.84 }], source: config.source };
    case 'http': return { simulated: true, status: 200, method: config.method };
    case 'transform': return { [String(config.outputVariable ?? 'result')]: ['simulated'] };
    case 'condition': return { result: branch === 'true', branch };
    case 'loop': return { items: 3, maxIterations: config.maxIterations };
    case 'approval': return { assignee: config.assignee, state: 'pending' };
    case 'notify': return { simulated: true, channel: config.channel, delivered: false };
    case 'output': return { name: config.name, value: 'Simulated result' };
  }
}

/**
 * Walk the graph from its trigger and fabricate per-node results. Nothing is executed: no model,
 * network or code runs. Approvals stop the run in `awaiting-approval`. Each node is visited once.
 */
export function simulateRun(graph: WorkflowGraph): SimulatedRun {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const trigger = graph.nodes.find((n) => n.type === 'trigger');
  if (!trigger) return { status: 'failed', durationMs: 0, tokens: 0, costUsd: 0, error: 'The workflow has no trigger.', steps: [] };

  const steps: RunStep[] = [];
  const seen = new Set<string>();
  let queue = [trigger.id];
  let status: RunStatus = 'succeeded';
  let tokens = 0;
  let previous: unknown = null;

  while (queue.length && status === 'succeeded') {
    const id = queue.shift() as string;
    const n = byId.get(id);
    if (!n || seen.has(id)) continue;
    seen.add(id);
    const [lo, hi] = DURATION[n.type];
    const durationMs = Math.round(lo + hash01(`${id}:d`) * (hi - lo));
    const branch = n.type === 'condition' ? (hash01(`${id}:b`) < 0.5 ? 'true' : 'false') : undefined;
    const stepTokens = n.type === 'llm' ? Math.round(120 + hash01(`${id}:t`) * Math.min(Number(n.config.maxTokens) || 512, 900)) : 0;
    const failed = n.type === 'http' && String(n.config.url).startsWith('https://') === false;
    const waiting = n.type === 'approval';
    const output = sampleOutput(n.type, n.config, branch);
    steps.push({
      nodeId: id,
      label: n.label,
      kind: n.type,
      status: failed ? 'failed' : waiting ? 'waiting' : 'succeeded',
      durationMs,
      tokens: stepTokens,
      input: previous,
      output,
      log: failed ? 'Blocked: only https URLs are allowed.' : waiting ? `Waiting for ${String(n.config.assignee)} to approve.` : `${NODE_CATALOG[n.type].label} completed${branch ? ` (took the ${branch} branch)` : ''}.`,
    });
    tokens += stepTokens;
    previous = output;
    if (failed) status = 'failed';
    else if (waiting) status = 'awaiting-approval';
    const next = graph.edges.filter((e) => e.source === id && (branch === undefined || e.sourceHandle === branch)).map((e) => e.target);
    queue = [...queue, ...next];
  }

  for (const n of graph.nodes) {
    if (!seen.has(n.id)) steps.push({ nodeId: n.id, label: n.label, kind: n.type, status: 'skipped', durationMs: 0, tokens: 0, input: null, output: null, log: 'Not reached in this run.' });
  }
  const durationMs = steps.reduce((sum, s) => sum + s.durationMs, 0);
  return {
    status,
    durationMs,
    tokens,
    costUsd: Math.round((tokens / 1_000_000) * 4 * 10_000) / 10_000,
    error: status === 'failed' ? (steps.find((s) => s.status === 'failed')?.log ?? 'Run failed.') : null,
    steps,
  };
}
