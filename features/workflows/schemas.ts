import { z } from '../_shared/zod';
import { isValidTimeZone, validateCron } from './cron';
import { NODE_KINDS, type NodeKind } from './types';

/** Tool and webhook URLs must be https. The server must additionally block private addresses (SSRF). */
export const httpsUrl = z
  .string()
  .trim()
  .min(1, 'Enter a URL.')
  .max(2048, 'URL is too long.')
  .refine((v) => {
    try {
      return new URL(v).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Enter a valid https:// URL. Plain http is not allowed.');

const identifier = z.string().trim().regex(/^[A-Za-z_][A-Za-z0-9_]{0,40}$/, 'Use letters, numbers and underscores, starting with a letter.');

export const triggerConfigSchema = z
  .object({ triggerType: z.enum(['manual', 'schedule', 'webhook', 'event']), eventName: z.string().trim().max(80) })
  .refine((v) => v.triggerType !== 'event' || v.eventName.length > 0, { path: ['eventName'], message: 'Choose the event that starts this workflow.' });

export const llmConfigSchema = z.object({
  modelId: z.string().trim().min(1, 'Select a model.'),
  promptTemplate: z.string().trim().min(1, 'Write a prompt.').max(8000, 'Prompt is too long (8000 characters max).'),
  temperature: z.number({ error: 'Enter a number between 0 and 2.' }).min(0, 'Minimum is 0.').max(2, 'Maximum is 2.'),
  maxTokens: z.number({ error: 'Enter a whole number.' }).int('Enter a whole number.').min(1, 'Minimum is 1.').max(32000, 'Maximum is 32000.'),
});

export const retrievalConfigSchema = z.object({
  source: z.string().trim().min(1, 'Select a source.'),
  topK: z.number({ error: 'Enter a whole number.' }).int('Enter a whole number.').min(1, 'Minimum is 1.').max(50, 'Maximum is 50.'),
  query: z.string().trim().min(1, 'Enter a query.').max(1000),
});

export const httpConfigSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  url: httpsUrl,
  headers: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Header name is required.').regex(/^[A-Za-z0-9-]+$/, 'Letters, numbers and hyphens only.'),
        value: z.string().max(2000),
      }),
    )
    .max(20, 'At most 20 headers.'),
  body: z.string().max(10000, 'Body is too long.'),
});

export const transformConfigSchema = z.object({
  expression: z.string().trim().min(1, 'Enter an expression.').max(2000, 'Expression is too long.'),
  outputVariable: identifier,
});

export const conditionConfigSchema = z.object({ expression: z.string().trim().min(1, 'Enter a condition.').max(500) });

export const loopConfigSchema = z.object({
  collection: z.string().trim().min(1, 'Enter the list to iterate.').max(200),
  itemVariable: identifier,
  maxIterations: z.number({ error: 'Enter a whole number.' }).int('Enter a whole number.').min(1, 'Minimum is 1.').max(1000, 'Maximum is 1000.'),
});

export const approvalConfigSchema = z.object({
  assignee: z.string().trim().min(1, 'Enter an assignee.').max(120),
  timeoutMinutes: z.number({ error: 'Enter a whole number.' }).int('Enter a whole number.').min(1, 'Minimum is 1 minute.').max(10080, 'Maximum is 7 days.'),
  onTimeout: z.enum(['reject', 'approve', 'escalate']),
});

export const notifyConfigSchema = z
  .object({ channel: z.enum(['email', 'slack', 'webhook']), target: z.string().trim().min(1, 'Enter a target.').max(2048), message: z.string().trim().min(1, 'Write a message.').max(2000) })
  .superRefine((v, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: 'custom', path: ['target'], message });
    if (v.channel === 'email' && !z.email().safeParse(v.target).success) fail('Enter a valid email address.');
    if (v.channel === 'slack' && !/^[#@][\w.-]{1,80}$/.test(v.target)) fail('Use a Slack channel like #ops or a person like @sam.');
    if (v.channel === 'webhook' && !httpsUrl.safeParse(v.target).success) fail('Enter a valid https:// URL.');
  });

export const outputConfigSchema = z.object({ name: identifier, format: z.enum(['text', 'json']) });

export const configSchemas = {
  trigger: triggerConfigSchema,
  llm: llmConfigSchema,
  retrieval: retrievalConfigSchema,
  http: httpConfigSchema,
  transform: transformConfigSchema,
  condition: conditionConfigSchema,
  loop: loopConfigSchema,
  approval: approvalConfigSchema,
  notify: notifyConfigSchema,
  output: outputConfigSchema,
} as const satisfies Record<NodeKind, z.ZodType>;

/* ------------------------------------------------------------------- graph --- */

export const graphNodeSchema = z.object({
  id: z.string().trim().min(1).max(64),
  type: z.enum(NODE_KINDS, { error: 'Unknown node type.' }),
  label: z.string().trim().min(1).max(80),
  position: z.object({ x: z.number().finite(), y: z.number().finite() }),
  config: z.record(z.string(), z.unknown()),
});

export const graphEdgeSchema = z.object({
  id: z.string().trim().min(1).max(100),
  source: z.string().trim().min(1).max(64),
  target: z.string().trim().min(1).max(64),
  sourceHandle: z.string().max(20).nullable().default(null),
});

export const graphSchema = z
  .object({ nodes: z.array(graphNodeSchema).max(200, 'A workflow can have at most 200 nodes.'), edges: z.array(graphEdgeSchema).max(500) })
  .superRefine((g, ctx) => {
    const ids = new Set<string>();
    for (const n of g.nodes) {
      if (ids.has(n.id)) ctx.addIssue({ code: 'custom', message: `Duplicate node id "${n.id}".` });
      ids.add(n.id);
    }
    for (const e of g.edges) {
      if (!ids.has(e.source) || !ids.has(e.target)) ctx.addIssue({ code: 'custom', message: `Connection "${e.id}" points at a node that does not exist.` });
    }
  });

/* ---------------------------------------------------------------- schedule --- */

export const scheduleSchema = z.object({
  cron: z.string().trim().superRefine((v, ctx) => {
    const error = validateCron(v);
    if (error) ctx.addIssue({ code: 'custom', message: error });
  }),
  timezone: z.string().refine(isValidTimeZone, 'Choose a valid time zone.'),
  concurrency: z.enum(['skip', 'queue', 'allow']),
  retryAttempts: z.number({ error: 'Enter a whole number.' }).int('Enter a whole number.').min(0, 'Minimum is 0.').max(10, 'Maximum is 10.'),
  backoff: z.enum(['none', 'linear', 'exponential']),
  paused: z.boolean(),
  catchUp: z.boolean(),
});

/* ------------------------------------------------------------- list forms --- */

export const TEMPLATE_IDS = ['blank', 'rag-qa', 'support-triage', 'daily-digest'] as const;

export const workflowFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80, 'Name must be 80 characters or fewer.'),
  description: z.string().trim().max(300, 'Description must be 300 characters or fewer.'),
  template: z.enum(TEMPLATE_IDS),
});
export type WorkflowFormValues = z.infer<typeof workflowFormSchema>;

export const saveWorkflowSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300),
  graph: graphSchema,
  schedule: scheduleSchema,
  note: z.string().trim().max(200).optional(),
});
export type SaveWorkflowInput = z.infer<typeof saveWorkflowSchema>;

export const statusChangeSchema = z.object({ status: z.enum(['draft', 'active', 'paused']) });
