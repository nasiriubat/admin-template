import { graphSchema, scheduleSchema } from './schemas';
import { z } from 'zod';
import type { ScheduleConfig, WorkflowGraph } from './types';

export const EXPORT_FORMAT = 'nexus.workflow';
export const MAX_IMPORT_BYTES = 512 * 1024;

const documentSchema = z.object({
  format: z.literal(EXPORT_FORMAT, { error: `Not a Nexus workflow file (expected format "${EXPORT_FORMAT}").` }),
  version: z.literal(1, { error: 'Unsupported workflow file version.' }),
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300).default(''),
  graph: graphSchema,
  schedule: scheduleSchema.optional(),
});

export interface WorkflowDocument {
  format: typeof EXPORT_FORMAT;
  version: 1;
  name: string;
  description: string;
  graph: WorkflowGraph;
  schedule?: ScheduleConfig;
}

/** Secrets are write-only: exported HTTP header values are blanked and must be re-entered after import. */
export function exportWorkflow(input: { name: string; description: string; graph: WorkflowGraph; schedule?: ScheduleConfig }): string {
  const graph: WorkflowGraph = {
    edges: input.graph.edges,
    nodes: input.graph.nodes.map((n) =>
      n.type === 'http' && Array.isArray(n.config.headers)
        ? { ...n, config: { ...n.config, headers: (n.config.headers as Array<{ name: string }>).map((h) => ({ name: h.name, value: '' })) } }
        : n,
    ),
  };
  const doc: WorkflowDocument = { format: EXPORT_FORMAT, version: 1, name: input.name, description: input.description, graph, schedule: input.schedule };
  return JSON.stringify(doc, null, 2);
}

export type ImportResult = { ok: true; document: WorkflowDocument } | { ok: false; error: string };

export function importWorkflow(text: string): ImportResult {
  if (new Blob([text]).size > MAX_IMPORT_BYTES) return { ok: false, error: `File is larger than ${MAX_IMPORT_BYTES / 1024} KB.` };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'File is not valid JSON.' };
  }
  const parsed = documentSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue.path.length ? ` (at ${issue.path.join('.')})` : '';
    return { ok: false, error: `${issue.message}${where}` };
  }
  return { ok: true, document: parsed.data as WorkflowDocument };
}
