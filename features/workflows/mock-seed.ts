import { createRng, daysAgo, minutesAgo } from '../_shared/mock-utils';
import { NODE_CATALOG } from './node-catalog';
import { simulateRun } from './simulate';
import { templateGraph } from './templates';
import { DEFAULT_SCHEDULE, type Workflow, type WorkflowGraph, type WorkflowRun, type RunStatus, type ScheduleConfig, type TemplateId, type TriggerType } from './types';

export const OWNERS = ['Avery Morgan', 'Jordan Lee', 'Sam Rivera'] as const;

export function triggerOf(graph: WorkflowGraph): TriggerType {
  const t = graph.nodes.find((n) => n.type === 'trigger')?.config.triggerType;
  return t === 'schedule' || t === 'webhook' || t === 'event' ? t : 'manual';
}

export function makeWebhook(id: string) {
  const token = `${id}${'x7k2q9'}`.replace(/[^a-z0-9]/gi, '').slice(0, 14);
  return { url: `https://hooks.nexus.example.com/w/${token}`, secretLast4: token.slice(-4) };
}

/** Graph with the trigger node switched to another type (used by seeds and the "new workflow" flow). */
export function withTrigger(graph: WorkflowGraph, triggerType: TriggerType, eventName = ''): WorkflowGraph {
  return { ...graph, nodes: graph.nodes.map((n) => (n.type === 'trigger' ? { ...n, config: { ...NODE_CATALOG.trigger.defaultConfig, ...n.config, triggerType, eventName } } : n)) };
}

function contractReviewGraph(): WorkflowGraph {
  const base = templateGraph('rag-qa');
  const ids = base.nodes.map((n) => n.id);
  const approval = { id: 'approve', type: 'approval' as const, label: 'Legal sign-off', position: { x: 3 * 310, y: 0 }, config: { ...NODE_CATALOG.approval.defaultConfig, assignee: 'legal@example.com' } };
  const out = base.nodes.find((n) => n.id === 'out');
  if (!out) return base;
  out.position = { x: 4 * 310, y: 0 };
  return { nodes: [...base.nodes.filter((n) => ids.includes(n.id)).slice(0, 3), approval, out], edges: [{ id: 'e1', source: 'trigger', target: 'retrieve', sourceHandle: null }, { id: 'e2', source: 'retrieve', target: 'answer', sourceHandle: null }, { id: 'e3', source: 'answer', target: 'approve', sourceHandle: null }, { id: 'e4', source: 'approve', target: 'out', sourceHandle: null }] };
}

interface SeedDef {
  name: string;
  description: string;
  template: TemplateId | 'contract';
  status: Workflow['status'];
  trigger: TriggerType;
  event?: string;
  schedule?: Partial<ScheduleConfig>;
}

const DEFS: SeedDef[] = [
  { name: 'Support ticket triage', description: 'Classifies incoming tickets, pages on-call for urgent ones and drafts replies for the rest.', template: 'support-triage', status: 'active', trigger: 'event', event: 'ticket.created' },
  { name: 'Documentation Q&A assistant', description: 'Answers product questions from the documentation with cited sources.', template: 'rag-qa', status: 'active', trigger: 'manual' },
  { name: 'Weekday revenue digest', description: 'Summarises yesterday\'s revenue and emails finance every weekday morning.', template: 'daily-digest', status: 'active', trigger: 'schedule', schedule: { cron: '0 9 * * 1-5', timezone: 'Europe/Helsinki' } },
  { name: 'Contract review', description: 'Retrieves clauses, drafts a risk summary and waits for legal sign-off.', template: 'contract', status: 'active', trigger: 'webhook' },
  { name: 'Hourly incident summary', description: 'Condenses new error logs into a short status note for the engineering channel.', template: 'daily-digest', status: 'active', trigger: 'schedule', schedule: { cron: '0 * * * *', timezone: 'UTC', concurrency: 'skip' } },
  { name: 'New user welcome notes', description: 'Writes a personalised onboarding checklist for every new sign-up.', template: 'rag-qa', status: 'paused', trigger: 'event', event: 'user.created' },
  { name: 'Knowledge gap finder', description: 'Weekly report of questions the assistant could not answer.', template: 'daily-digest', status: 'paused', trigger: 'schedule', schedule: { cron: '0 8 * * 1', timezone: 'UTC', paused: true } },
  { name: 'Invoice reminder drafts', description: 'Drafts polite reminders for invoices that are a week overdue.', template: 'support-triage', status: 'draft', trigger: 'manual' },
  { name: 'Release notes writer', description: 'Turns merged pull request titles into customer-facing release notes.', template: 'blank', status: 'draft', trigger: 'manual' },
  { name: 'API key rotation notice', description: 'Notifies owners when an API key was rotated.', template: 'blank', status: 'draft', trigger: 'event', event: 'api-key.rotated' },
  { name: 'Failed job explainer', description: 'Explains why a background job failed and suggests a fix.', template: 'rag-qa', status: 'active', trigger: 'event', event: 'job.failed' },
  { name: 'Quarterly business review pack', description: 'Collects metrics and drafts the quarterly review narrative.', template: 'daily-digest', status: 'draft', trigger: 'schedule', schedule: { cron: '0 7 1 */3 *', timezone: 'America/New_York' } },
];

export function seedWorkflows(): Workflow[] {
  return DEFS.map((d, i) => {
    const id = `wf-${String(i + 1).padStart(3, '0')}`;
    const base = d.template === 'contract' ? contractReviewGraph() : templateGraph(d.template);
    const graph = withTrigger(base, d.trigger, d.event ?? '');
    const savedAt = daysAgo(2 + i * 3);
    return {
      id,
      name: d.name,
      description: d.description,
      status: d.status,
      trigger: d.trigger,
      schedule: { ...DEFAULT_SCHEDULE, ...d.schedule },
      webhook: makeWebhook(id),
      graph,
      version: 3,
      versions: [3, 2, 1].map((v) => ({ version: v, savedAt: daysAgo(2 + i * 3 + (3 - v) * 2), author: OWNERS[(i + v) % 3], note: v === 1 ? 'Created' : v === 2 ? 'Tuned prompts' : 'Latest changes', nodeCount: graph.nodes.length, graph })),
      owner: OWNERS[i % 3],
      nextRunAt: null,
      lastRunStatus: null,
      lastRunAt: null,
      createdAt: daysAgo(30 + i),
      updatedAt: savedAt,
    };
  });
}

const FAILURES = ['Model provider returned 429: rate limit exceeded.', 'Tool call timed out after 10s.', 'Retrieval source "Support playbooks" is paused.', 'Output exceeded the maximum token budget.'];

export function seedRuns(workflows: Workflow[]): WorkflowRun[] {
  const rng = createRng(77031);
  const runnable = workflows.filter((w) => w.status !== 'draft');
  return Array.from({ length: 64 }, (_, i) => {
    const w = i === 0 ? (workflows.find((x) => x.name === 'Contract review') as Workflow) : rng.pick(runnable);
    const roll = rng.int(1, 100);
    const status: RunStatus = i === 0 ? 'awaiting-approval' : i < 3 ? 'running' : i === 3 ? 'queued' : roll <= 68 ? 'succeeded' : roll <= 86 ? 'failed' : 'cancelled';
    return buildRun(`run_${(94120 - i * 7).toString(36)}`, w, status, minutesAgo(i * 38 + rng.int(1, 30)), rng.pick(FAILURES));
  });
}

/** Build a run from the simulator, then force the requested terminal state. */
export function buildRun(id: string, w: Pick<Workflow, 'id' | 'name' | 'graph' | 'trigger'>, status: RunStatus, startedAt: string, failure = FAILURES[0]): WorkflowRun {
  const sim = simulateRun(w.graph);
  const base: WorkflowRun = { id, workflowId: w.id, workflowName: w.name, trigger: w.trigger, status, startedAt, durationMs: sim.durationMs, tokens: sim.tokens, costUsd: sim.costUsd, error: null, steps: sim.steps };
  if (status === 'queued') return { ...base, durationMs: null, tokens: 0, costUsd: 0, steps: [] };
  if (status === 'running') return { ...base, durationMs: null, steps: sim.steps.filter((s) => s.status !== 'skipped').slice(0, -1) };
  if (status === 'awaiting-approval') {
    const hasApproval = sim.steps.some((s) => s.status === 'waiting');
    return hasApproval ? { ...base, durationMs: null } : { ...base, durationMs: null, steps: sim.steps.slice(0, 2) };
  }
  if (status === 'failed') {
    const executed = sim.steps.filter((s) => s.status !== 'skipped');
    const at = Math.max(1, executed.length - 2);
    const steps = sim.steps.map((s) => (s.nodeId === executed[at]?.nodeId ? { ...s, status: 'failed' as const, log: failure, output: { error: failure } } : executed.slice(at + 1).some((x) => x.nodeId === s.nodeId) ? { ...s, status: 'skipped' as const, output: null } : s));
    return { ...base, status, error: failure, steps };
  }
  if (status === 'cancelled') return { ...base, error: 'Cancelled by a person.', steps: sim.steps.filter((s) => s.status !== 'waiting') };
  return { ...base, steps: sim.steps.map((s) => (s.status === 'waiting' ? { ...s, status: 'succeeded' as const } : s)) };
}
