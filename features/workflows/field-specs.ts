import { EVENT_CATALOGUE, KNOWLEDGE_SOURCES, TRIGGER_TYPES, type NodeKind } from './types';

type Option = { value: string; label: string };

export interface FieldSpec {
  name: string;
  label: string;
  kind: 'text' | 'textarea' | 'number' | 'select' | 'models' | 'headers';
  options?: Option[];
  hint?: string;
  placeholder?: string;
  rows?: number;
  step?: number;
  /** Only render when the predicate on the current form values is true. */
  showIf?: (values: Record<string, unknown>) => boolean;
  mono?: boolean;
}

const opts = (values: readonly string[]): Option[] => values.map((v) => ({ value: v, label: v }));

/** Declarative form layout per node kind. Validation lives in `configSchemas`. */
export const FIELD_SPECS: Record<NodeKind, FieldSpec[]> = {
  trigger: [
    { name: 'triggerType', label: 'Trigger type', kind: 'select', options: TRIGGER_TYPES.map((t) => ({ value: t.value, label: t.label })), hint: 'Schedule, webhook and event details are in the Trigger & schedule tab.' },
    { name: 'eventName', label: 'Event', kind: 'select', options: EVENT_CATALOGUE.map((e) => ({ value: e.value, label: e.label })), showIf: (v) => v.triggerType === 'event' },
  ],
  llm: [
    { name: 'modelId', label: 'Model', kind: 'models', hint: 'Models come from AI → Models. Only enabled chat models are listed.' },
    { name: 'promptTemplate', label: 'Prompt template', kind: 'textarea', rows: 7, mono: true, hint: 'Use {{variable}} to insert data from earlier steps.' },
    { name: 'temperature', label: 'Temperature', kind: 'number', step: 0.1, hint: '0 is focused, 2 is highly varied.' },
    { name: 'maxTokens', label: 'Max output tokens', kind: 'number', step: 1 },
  ],
  retrieval: [
    { name: 'source', label: 'Knowledge source', kind: 'select', options: opts(KNOWLEDGE_SOURCES) },
    { name: 'topK', label: 'Passages to retrieve (top-k)', kind: 'number', step: 1 },
    { name: 'query', label: 'Query', kind: 'text', mono: true, hint: 'Template for the search text, e.g. {{input}}.' },
  ],
  http: [
    { name: 'method', label: 'Method', kind: 'select', options: opts(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']) },
    { name: 'url', label: 'URL', kind: 'text', placeholder: 'https://api.example.com/v1/items', hint: 'https only. The server also blocks private and internal addresses.' },
    { name: 'headers', label: 'Headers', kind: 'headers' },
    { name: 'body', label: 'Body', kind: 'textarea', rows: 4, mono: true, showIf: (v) => v.method !== 'GET' },
  ],
  transform: [
    { name: 'expression', label: 'Expression', kind: 'textarea', rows: 5, mono: true, hint: 'Stored with the workflow and evaluated only by the server sandbox, never in the browser.' },
    { name: 'outputVariable', label: 'Output variable', kind: 'text', mono: true },
  ],
  condition: [{ name: 'expression', label: 'Condition', kind: 'text', mono: true, hint: 'Steps on the true and false handles run depending on the result.' }],
  loop: [
    { name: 'collection', label: 'List to iterate', kind: 'text', mono: true },
    { name: 'itemVariable', label: 'Item variable', kind: 'text', mono: true },
    { name: 'maxIterations', label: 'Maximum iterations', kind: 'number', step: 1 },
  ],
  approval: [
    { name: 'assignee', label: 'Assignee', kind: 'text', placeholder: 'person@example.com or a role', hint: 'The run pauses until this person approves or rejects.' },
    { name: 'timeoutMinutes', label: 'Timeout (minutes)', kind: 'number', step: 1 },
    { name: 'onTimeout', label: 'When the timeout passes', kind: 'select', options: [{ value: 'reject', label: 'Reject the run' }, { value: 'approve', label: 'Approve automatically' }, { value: 'escalate', label: 'Escalate to an admin' }] },
  ],
  notify: [
    { name: 'channel', label: 'Channel', kind: 'select', options: [{ value: 'email', label: 'Email' }, { value: 'slack', label: 'Slack' }, { value: 'webhook', label: 'Webhook' }] },
    { name: 'target', label: 'Target', kind: 'text', hint: 'Email address, Slack #channel or @person, or an https webhook URL.' },
    { name: 'message', label: 'Message', kind: 'textarea', rows: 4 },
  ],
  output: [
    { name: 'name', label: 'Output name', kind: 'text', mono: true },
    { name: 'format', label: 'Format', kind: 'select', options: [{ value: 'text', label: 'Text' }, { value: 'json', label: 'JSON' }] },
  ],
};
