import type { ListQuery } from '@nexus/api-client';
import { api } from '../_shared/api';
import type { AiModel } from '../ai/types';
import type { SaveWorkflowInput, WorkflowFormValues } from './schemas';
import type { RunStats, Workflow, WorkflowGraph, WorkflowRun, WorkflowStatus, WorkflowSummary } from './types';

const id = encodeURIComponent;

/** Used when the AI module is disabled or unreachable so the builder still offers sensible choices. */
export const FALLBACK_MODELS: Pick<AiModel, 'modelId' | 'displayName' | 'providerName'>[] = [
  { modelId: 'claude-sonnet', displayName: 'Claude Sonnet', providerName: 'Anthropic' },
  { modelId: 'claude-haiku', displayName: 'Claude Haiku', providerName: 'Anthropic' },
  { modelId: 'gpt-4o', displayName: 'GPT-4o', providerName: 'OpenAI' },
  { modelId: 'gpt-4o-mini', displayName: 'GPT-4o mini', providerName: 'OpenAI' },
];

export const workflowsService = {
  list: (query: ListQuery, signal?: AbortSignal) => api.list<WorkflowSummary>('/workflows', query, { signal }),
  get: (workflowId: string, signal?: AbortSignal) => api.get<Workflow>(`/workflows/${id(workflowId)}`, { signal }),
  create: (values: WorkflowFormValues) => api.post<WorkflowSummary>('/workflows', values),
  save: (workflowId: string, input: SaveWorkflowInput) => api.put<Workflow>(`/workflows/${id(workflowId)}`, input),
  remove: (workflowId: string) => api.delete<{ id: string }>(`/workflows/${id(workflowId)}`),
  setStatus: (workflowId: string, status: WorkflowStatus) => api.post<Workflow>(`/workflows/${id(workflowId)}/status`, { status }),
  duplicate: (workflowId: string) => api.post<WorkflowSummary>(`/workflows/${id(workflowId)}/duplicate`),
  run: (workflowId: string) => api.post<WorkflowRun>(`/workflows/${id(workflowId)}/run`),
  test: (workflowId: string, graph: WorkflowGraph) => api.post<WorkflowRun>(`/workflows/${id(workflowId)}/test`, { graph }),
  restore: (workflowId: string, version: number) => api.post<Workflow>(`/workflows/${id(workflowId)}/restore`, { version }),
  rotateWebhookSecret: (workflowId: string) => api.post<{ secret: string; secretLast4: string }>(`/workflows/${id(workflowId)}/webhook/rotate`),
  models: async (signal?: AbortSignal) => {
    try {
      const page = await api.list<AiModel>('/ai/models', { page: 1, pageSize: 100 }, { signal });
      const chat = page.items.filter((m) => m.enabled && m.capabilities.includes('chat'));
      return chat.length ? chat : FALLBACK_MODELS;
    } catch {
      return FALLBACK_MODELS;
    }
  },
  runs: {
    list: (query: ListQuery, signal?: AbortSignal) => api.list<WorkflowRun>('/workflows/runs', query, { signal }),
    stats: (signal?: AbortSignal) => api.get<RunStats>('/workflows/runs/stats', { signal }),
    retry: (runId: string) => api.post<WorkflowRun>(`/workflows/runs/${id(runId)}/retry`),
    cancel: (runId: string) => api.post<WorkflowRun>(`/workflows/runs/${id(runId)}/cancel`),
    approve: (runId: string) => api.post<WorkflowRun>(`/workflows/runs/${id(runId)}/approve`),
    reject: (runId: string) => api.post<WorkflowRun>(`/workflows/runs/${id(runId)}/reject`),
  },
};
