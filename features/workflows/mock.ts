import { ApiError, createCollection } from '@nexus/api-client';
import { mockRouter } from '../_shared/mock-router';
import { nextRuns } from './cron';
import { hasErrors, validateGraph } from './graph';
import { buildRun, makeWebhook, OWNERS, seedRuns, seedWorkflows, triggerOf, withTrigger } from './mock-seed';
import { simulateRun } from './simulate';
import { saveWorkflowSchema, statusChangeSchema, workflowFormSchema } from './schemas';
import { templateGraph, templateTrigger } from './templates';
import { DEFAULT_SCHEDULE, SECRET_MASK, type RunStats, type Workflow, type WorkflowGraph, type WorkflowRun, type WorkflowSummary } from './types';

const workflows = createCollection<Workflow>(seedWorkflows(), { searchFields: ['name', 'description', 'owner'], filterFields: ['status', 'trigger'], defaultSort: { field: 'updatedAt', direction: 'desc' } });
const runs = createCollection<WorkflowRun>(seedRuns(workflows.all()), { searchFields: ['id', 'workflowName'], filterFields: ['status', 'trigger', 'workflowId'], defaultSort: { field: 'startedAt', direction: 'desc' } });

const invalid = (message: string, fields?: Record<string, string>) => new ApiError('VALIDATION_ERROR', message, 422, fields);
const conflict = (message: string) => new ApiError('CONFLICT', message, 409);
const firstIssue = (e: { issues: Array<{ message: string }> }) => e.issues[0]?.message ?? 'Some of the information provided is not valid.';

/** Header values are write-only: responses carry a mask, and saves that echo the mask keep the stored value. */
function maskGraph(graph: WorkflowGraph): WorkflowGraph {
  return { ...graph, nodes: graph.nodes.map((n) => (n.type === 'http' && Array.isArray(n.config.headers) ? { ...n, config: { ...n.config, headers: (n.config.headers as Array<{ name: string; value: string }>).map((h) => ({ ...h, value: h.value ? SECRET_MASK : '' })) } } : n)) };
}

function restoreSecrets(previous: WorkflowGraph, next: WorkflowGraph): WorkflowGraph {
  return {
    ...next,
    nodes: next.nodes.map((n) => {
      if (n.type !== 'http' || !Array.isArray(n.config.headers)) return n;
      const before = previous.nodes.find((p) => p.id === n.id)?.config.headers as Array<{ name: string; value: string }> | undefined;
      const headers = (n.config.headers as Array<{ name: string; value: string }>).map((h) => (h.value === SECRET_MASK ? { ...h, value: before?.find((b) => b.name === h.name)?.value ?? '' } : h));
      return { ...n, config: { ...n.config, headers } };
    }),
  };
}

function nextRunAt(w: Workflow): string | null {
  if (w.status !== 'active' || w.trigger !== 'schedule' || w.schedule.paused) return null;
  return nextRuns(w.schedule.cron, w.schedule.timezone, 1)[0]?.toISOString() ?? null;
}

function latestRun(workflowId: string) {
  return runs.all().filter((r) => r.workflowId === workflowId).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
}

function view(w: Workflow): Workflow {
  const last = latestRun(w.id);
  return { ...w, graph: maskGraph(w.graph), nextRunAt: nextRunAt(w), lastRunStatus: last?.status ?? null, lastRunAt: last?.startedAt ?? null };
}

function summary(w: Workflow): WorkflowSummary {
  const full = view(w);
  const rest: Partial<Workflow> = { ...full };
  delete rest.graph;
  delete rest.versions;
  return { ...(rest as Omit<Workflow, 'graph' | 'versions'>), nodeCount: full.graph.nodes.length };
}

function pushVersion(w: Workflow, graph: WorkflowGraph, note: string): Pick<Workflow, 'version' | 'versions'> {
  const version = w.version + 1;
  return { version, versions: [{ version, savedAt: new Date().toISOString(), author: OWNERS[0], note, nodeCount: graph.nodes.length, graph }, ...w.versions].slice(0, 20) };
}

function recordRun(w: Workflow, graph: WorkflowGraph, status: WorkflowRun['status'] | null): WorkflowRun {
  const id = `run_${Date.now().toString(36)}${runs.all().length.toString(36)}`;
  const run = buildRun(id, { id: w.id, name: w.name, graph, trigger: w.trigger }, status ?? simulateRun(graph).status, new Date().toISOString());
  return runs.create(run);
}

// Order matters: the literal /workflows/runs paths must be registered before /workflows/:id.
mockRouter.on('GET', '/workflows/runs', ({ query }) => runs.list(query));
mockRouter.on('GET', '/workflows/runs/stats', (): RunStats => {
  const since = Date.now() - 24 * 3_600_000;
  const recent = runs.all().filter((r) => new Date(r.startedAt).getTime() >= since);
  const done = recent.filter((r) => r.status === 'succeeded' || r.status === 'failed');
  const timed = done.filter((r) => r.durationMs !== null);
  return {
    runs24h: recent.length,
    successRate: done.length ? done.filter((r) => r.status === 'succeeded').length / done.length : 0,
    avgDurationMs: timed.length ? Math.round(timed.reduce((s, r) => s + (r.durationMs ?? 0), 0) / timed.length) : 0,
    tokens24h: recent.reduce((s, r) => s + r.tokens, 0),
  };
});
mockRouter.on('POST', '/workflows/runs/:id/retry', ({ params }) => {
  const run = runs.get(params.id);
  if (run.status !== 'failed') throw conflict('Only failed runs can be retried.');
  return runs.create({ ...run, id: `${run.id}-r${Date.now().toString(36).slice(-3)}`, status: 'queued', startedAt: new Date().toISOString(), durationMs: null, tokens: 0, costUsd: 0, error: null, steps: [] });
});
mockRouter.on('POST', '/workflows/runs/:id/cancel', ({ params }) => {
  const run = runs.get(params.id);
  if (run.status !== 'queued' && run.status !== 'running') throw conflict('Only queued or running runs can be cancelled.');
  return runs.update(run.id, { status: 'cancelled', error: 'Cancelled by a person.' });
});
mockRouter.on('POST', '/workflows/runs/:id/approve', ({ params }) => {
  const run = runs.get(params.id);
  if (run.status !== 'awaiting-approval') throw conflict('This run is not waiting for approval.');
  return runs.update(run.id, { status: 'succeeded', durationMs: run.steps.reduce((s, x) => s + x.durationMs, 0), steps: run.steps.map((s) => (s.status === 'waiting' ? { ...s, status: 'succeeded' as const, log: 'Approved.' } : s)) });
});
mockRouter.on('POST', '/workflows/runs/:id/reject', ({ params }) => {
  const run = runs.get(params.id);
  if (run.status !== 'awaiting-approval') throw conflict('This run is not waiting for approval.');
  return runs.update(run.id, { status: 'cancelled', error: 'Rejected by the approver.', durationMs: run.steps.reduce((s, x) => s + x.durationMs, 0) });
});

mockRouter.on('GET', '/workflows', ({ query }) => {
  const page = workflows.list(query);
  return { __meta: page.__meta, data: (page.data as Workflow[]).map(summary) };
});
mockRouter.on('POST', '/workflows', ({ body }) => {
  const parsed = workflowFormSchema.safeParse(body);
  if (!parsed.success) throw invalid(firstIssue(parsed.error), Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
  const { name, description, template } = parsed.data;
  const id = `wf-${Date.now().toString(36)}`;
  const graph = withTrigger(templateGraph(template), templateTrigger(template), template === 'support-triage' ? 'ticket.created' : '');
  const now = new Date().toISOString();
  const created = workflows.create({ id, name, description, status: 'draft', trigger: triggerOf(graph), schedule: DEFAULT_SCHEDULE, webhook: makeWebhook(id), graph, version: 1, versions: [{ version: 1, savedAt: now, author: OWNERS[0], note: 'Created', nodeCount: graph.nodes.length, graph }], owner: OWNERS[0], nextRunAt: null, lastRunStatus: null, lastRunAt: null, createdAt: now, updatedAt: now });
  return summary(created);
});
mockRouter.on('GET', '/workflows/:id', ({ params }) => view(workflows.get(params.id)));
mockRouter.on('PUT', '/workflows/:id', ({ params, body }) => {
  const w = workflows.get(params.id);
  const parsed = saveWorkflowSchema.safeParse(body);
  if (!parsed.success) throw invalid(firstIssue(parsed.error));
  const graph = restoreSecrets(w.graph, parsed.data.graph as WorkflowGraph);
  if (w.status === 'active' && hasErrors(validateGraph(graph))) throw invalid('Active workflows must be valid. Pause the workflow or fix the errors first.');
  return view(workflows.update(w.id, { name: parsed.data.name, description: parsed.data.description, graph, schedule: parsed.data.schedule, trigger: triggerOf(graph), updatedAt: new Date().toISOString(), ...pushVersion(w, graph, parsed.data.note || 'Saved changes') }));
});
mockRouter.on('DELETE', '/workflows/:id', ({ params }) => {
  for (const r of runs.all().filter((x) => x.workflowId === params.id)) runs.remove(r.id);
  return workflows.remove(params.id);
});
mockRouter.on('POST', '/workflows/:id/status', ({ params, body }) => {
  const w = workflows.get(params.id);
  const parsed = statusChangeSchema.safeParse(body);
  if (!parsed.success) throw invalid('Choose a valid status.');
  if (parsed.data.status === 'active' && hasErrors(validateGraph(w.graph))) throw invalid('Fix the validation errors before activating this workflow.');
  return view(workflows.update(w.id, { status: parsed.data.status, updatedAt: new Date().toISOString() }));
});
mockRouter.on('POST', '/workflows/:id/duplicate', ({ params }) => {
  const w = workflows.get(params.id);
  const id = `wf-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const copy = workflows.create({ ...w, id, name: `${w.name} (copy)`, status: 'draft', webhook: makeWebhook(id), version: 1, versions: [{ version: 1, savedAt: now, author: OWNERS[0], note: `Duplicated from ${w.name}`, nodeCount: w.graph.nodes.length, graph: w.graph }], createdAt: now, updatedAt: now });
  return summary(copy);
});
mockRouter.on('POST', '/workflows/:id/run', ({ params }) => {
  const w = workflows.get(params.id);
  if (w.status === 'draft') throw conflict('Activate the workflow before running it.');
  if (hasErrors(validateGraph(w.graph))) throw invalid('Fix the validation errors before running this workflow.');
  return recordRun(w, w.graph, 'queued');
});
mockRouter.on('POST', '/workflows/:id/test', ({ params, body }) => {
  const w = workflows.get(params.id);
  const candidate = (body as { graph?: WorkflowGraph } | null)?.graph;
  const graph = candidate ? restoreSecrets(w.graph, candidate) : w.graph;
  if (hasErrors(validateGraph(graph))) throw invalid('Fix the validation errors before running a test.');
  return recordRun({ ...w, trigger: triggerOf(graph) }, graph, null);
});
mockRouter.on('POST', '/workflows/:id/restore', ({ params, body }) => {
  const w = workflows.get(params.id);
  const version = w.versions.find((v) => v.version === (body as { version?: number } | null)?.version);
  if (!version) throw new ApiError('NOT_FOUND', 'Version not found.', 404);
  return view(workflows.update(w.id, { graph: version.graph, trigger: triggerOf(version.graph), updatedAt: new Date().toISOString(), ...pushVersion(w, version.graph, `Restored version ${version.version}`) }));
});
mockRouter.on('POST', '/workflows/:id/webhook/rotate', ({ params }) => {
  const w = workflows.get(params.id);
  const secret = `whsec_${Math.random().toString(36).slice(2, 12)}${Math.random().toString(36).slice(2, 12)}`;
  workflows.update(w.id, { webhook: { url: w.webhook?.url ?? makeWebhook(w.id).url, secretLast4: secret.slice(-4) } });
  return { secret, secretLast4: secret.slice(-4) };
});
