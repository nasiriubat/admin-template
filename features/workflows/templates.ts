import { NODE_CATALOG } from './node-catalog';
import { NODE_WIDTH } from './graph';
import type { NodeKind, TemplateId, WorkflowEdge, WorkflowGraph, WorkflowNode } from './types';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  icon: string;
  nodes: number;
}

export const TEMPLATES: ReadonlyArray<TemplateInfo> = [
  { id: 'blank', name: 'Blank', description: 'A manual trigger connected to an output. Start from scratch.', icon: 'Plus', nodes: 2 },
  { id: 'rag-qa', name: 'RAG Q&A agent', description: 'Retrieve passages from a knowledge source, then answer with citations.', icon: 'BookOpen', nodes: 4 },
  { id: 'support-triage', name: 'Support triage', description: 'Classify new tickets, alert Slack when urgent, draft a reply otherwise.', icon: 'LifeBuoy', nodes: 7 },
  { id: 'daily-digest', name: 'Daily digest', description: 'Fetch metrics every weekday morning, summarise them and email the team.', icon: 'Mail', nodes: 5 },
];

const GAP = NODE_WIDTH + 90;

function node(id: string, type: NodeKind, label: string, col: number, row: number, config: Record<string, unknown> = {}): WorkflowNode {
  return { id, type, label, position: { x: col * GAP, y: row * 130 }, config: { ...NODE_CATALOG[type].defaultConfig, ...config } };
}

function edge(source: string, target: string, sourceHandle: string | null = null): WorkflowEdge {
  return { id: `e-${source}-${sourceHandle ?? 'out'}-${target}`, source, target, sourceHandle };
}

/** Seed graph for a template. Always returns fresh objects so callers may mutate them. */
export function templateGraph(id: TemplateId): WorkflowGraph {
  switch (id) {
    case 'rag-qa':
      return {
        nodes: [
          node('trigger', 'trigger', 'Question received', 0, 0),
          node('retrieve', 'retrieval', 'Search documentation', 1, 0, { topK: 5 }),
          node('answer', 'llm', 'Answer with citations', 2, 0, { promptTemplate: 'Answer the question using only the context below. Cite the document titles you used.\n\nContext: {{retrieve.passages}}\n\nQuestion: {{input}}' }),
          node('out', 'output', 'Answer', 3, 0, { name: 'answer' }),
        ],
        edges: [edge('trigger', 'retrieve'), edge('retrieve', 'answer'), edge('answer', 'out')],
      };
    case 'support-triage':
      return {
        nodes: [
          node('trigger', 'trigger', 'Ticket created', 0, 1, { triggerType: 'event', eventName: 'ticket.created' }),
          node('classify', 'llm', 'Classify priority', 1, 1, { modelId: 'claude-haiku', temperature: 0, maxTokens: 200, promptTemplate: 'Classify this support ticket as urgent or normal and name the product area.\n\nTicket: {{ticket.body}}' }),
          node('urgent', 'condition', 'Is urgent?', 2, 1, { expression: 'classify.priority == "urgent"' }),
          node('slack', 'notify', 'Alert on-call', 3, 0, { channel: 'slack', target: '#support-oncall', message: 'Urgent ticket: {{ticket.subject}}' }),
          node('draft', 'llm', 'Draft reply', 3, 2, { promptTemplate: 'Write a friendly reply to this ticket in under 120 words.\n\nTicket: {{ticket.body}}' }),
          node('out-alert', 'output', 'Escalated', 4, 0, { name: 'escalated' }),
          node('out-reply', 'output', 'Draft reply', 4, 2, { name: 'reply' }),
        ],
        edges: [edge('trigger', 'classify'), edge('classify', 'urgent'), edge('urgent', 'slack', 'true'), edge('urgent', 'draft', 'false'), edge('slack', 'out-alert'), edge('draft', 'out-reply')],
      };
    case 'daily-digest':
      return {
        nodes: [
          node('trigger', 'trigger', 'Every weekday morning', 0, 0, { triggerType: 'schedule' }),
          node('metrics', 'http', 'Fetch yesterday metrics', 1, 0, { url: 'https://api.example.com/v1/metrics/daily' }),
          node('summary', 'llm', 'Summarise', 2, 0, { modelId: 'gpt-4o-mini', promptTemplate: 'Summarise these metrics in five bullet points and flag anything unusual.\n\nMetrics: {{metrics.body}}' }),
          node('mail', 'notify', 'Email the team', 3, 0, { channel: 'email', target: 'team@example.com', message: '{{summary.text}}' }),
          node('out', 'output', 'Digest', 4, 0, { name: 'digest' }),
        ],
        edges: [edge('trigger', 'metrics'), edge('metrics', 'summary'), edge('summary', 'mail'), edge('mail', 'out')],
      };
    default:
      return {
        nodes: [node('trigger', 'trigger', 'Start', 0, 0), node('out', 'output', 'Result', 1, 0)],
        edges: [edge('trigger', 'out')],
      };
  }
}

export const templateTrigger = (id: TemplateId) => (id === 'support-triage' ? 'event' : id === 'daily-digest' ? 'schedule' : 'manual');
