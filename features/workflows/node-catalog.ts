import type { NodeKind, WorkflowNode } from './types';

export interface NodeSpec {
  kind: NodeKind;
  label: string;
  description: string;
  icon: string;
  /** Token-based classes for the icon chip. */
  tone: string;
  hasInput: boolean;
  hasOutput: boolean;
  defaultConfig: Record<string, unknown>;
}

export const NODE_CATALOG: Record<NodeKind, NodeSpec> = {
  trigger: { kind: 'trigger', label: 'Trigger', description: 'Starts the workflow: manual, schedule, webhook or event.', icon: 'Zap', tone: 'bg-warning/10 text-warning', hasInput: false, hasOutput: true, defaultConfig: { triggerType: 'manual', eventName: '' } },
  llm: { kind: 'llm', label: 'LLM Call', description: 'Send a prompt template to a configured model.', icon: 'Brain', tone: 'bg-primary/10 text-primary', hasInput: true, hasOutput: true, defaultConfig: { modelId: 'claude-sonnet', promptTemplate: 'Answer the question using the context.\n\nQuestion: {{input}}', temperature: 0.2, maxTokens: 1024 } },
  retrieval: { kind: 'retrieval', label: 'Knowledge Retrieval', description: 'Fetch relevant passages from a knowledge source.', icon: 'BookOpen', tone: 'bg-info/10 text-info', hasInput: true, hasOutput: true, defaultConfig: { source: 'Product documentation', topK: 5, query: '{{input}}' } },
  http: { kind: 'http', label: 'Tool / HTTP Call', description: 'Call an external HTTPS API.', icon: 'Globe', tone: 'bg-accent/10 text-accent', hasInput: true, hasOutput: true, defaultConfig: { method: 'GET', url: 'https://api.example.com/v1/', headers: [], body: '' } },
  transform: { kind: 'transform', label: 'Code / Transform', description: 'Reshape data with an expression (stored, never evaluated in the browser).', icon: 'Code2', tone: 'bg-secondary/10 text-secondary', hasInput: true, hasOutput: true, defaultConfig: { expression: 'input.items.map(item => item.title)', outputVariable: 'result' } },
  condition: { kind: 'condition', label: 'Condition', description: 'Branch on a true or false expression.', icon: 'Split', tone: 'bg-warning/10 text-warning', hasInput: true, hasOutput: true, defaultConfig: { expression: 'input.priority == "urgent"' } },
  loop: { kind: 'loop', label: 'Loop / Map', description: 'Repeat the connected steps for every item.', icon: 'RefreshCcw', tone: 'bg-info/10 text-info', hasInput: true, hasOutput: true, defaultConfig: { collection: 'input.items', itemVariable: 'item', maxIterations: 100 } },
  approval: { kind: 'approval', label: 'Human Approval', description: 'Pause until a person approves or rejects.', icon: 'Hand', tone: 'bg-success/10 text-success', hasInput: true, hasOutput: true, defaultConfig: { assignee: 'ops@example.com', timeoutMinutes: 240, onTimeout: 'reject' } },
  notify: { kind: 'notify', label: 'Notify', description: 'Send an email, Slack message or webhook.', icon: 'Send', tone: 'bg-accent/10 text-accent', hasInput: true, hasOutput: true, defaultConfig: { channel: 'email', target: 'team@example.com', message: 'Workflow {{workflow.name}} finished.' } },
  output: { kind: 'output', label: 'Output', description: 'Final result returned by the workflow.', icon: 'CheckCircle2', tone: 'bg-success/10 text-success', hasInput: true, hasOutput: false, defaultConfig: { name: 'result', format: 'text' } },
};

/** Order shown in the palette. */
export const PALETTE_KINDS: NodeKind[] = ['trigger', 'llm', 'retrieval', 'http', 'transform', 'condition', 'loop', 'approval', 'notify', 'output'];

export const DEFAULT_LABELS: Record<NodeKind, string> = Object.fromEntries(Object.values(NODE_CATALOG).map((s) => [s.kind, s.label])) as Record<NodeKind, string>;

const text = (v: unknown) => (typeof v === 'string' ? v : '');

/** One-line, secret-free summary shown under the node title and in the outline. */
export function nodeSummary(node: Pick<WorkflowNode, 'type' | 'config'>): string {
  const c = node.config;
  switch (node.type) {
    case 'trigger': return text(c.triggerType) === 'event' && text(c.eventName) ? `Event: ${text(c.eventName)}` : `${text(c.triggerType) || 'manual'} trigger`;
    case 'llm': return text(c.modelId) || 'No model selected';
    case 'retrieval': return `${text(c.source)} · top ${String(c.topK ?? '')}`;
    case 'http': return `${text(c.method)} ${text(c.url).replace(/^https:\/\//, '')}`;
    case 'transform': return text(c.expression).slice(0, 48);
    case 'condition': return text(c.expression).slice(0, 48);
    case 'loop': return `For each ${text(c.itemVariable)} in ${text(c.collection)}`;
    case 'approval': return `Assignee: ${text(c.assignee)}`;
    case 'notify': return `${text(c.channel)} → ${text(c.target)}`;
    case 'output': return `${text(c.name)} (${text(c.format)})`;
  }
}
