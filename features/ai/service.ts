import type { ListQuery } from '@nexus/api-client';
import { api } from '../_shared/api';
import type { PricingValues, PromptFormValues, ProviderFormValues } from './schemas';
import type { AiModel, ConnectionTestResult, Prompt, Provider, TaskType, UsageRange, UsageReport } from './types';

const id = encodeURIComponent;

/** API keys are sent on create/replace only; no response ever contains one. */
const providerBody = (v: Partial<ProviderFormValues>) => ({ ...v, apiKey: v.apiKey || undefined });
const promptBody = (v: PromptFormValues) => ({ ...v, tags: v.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) });

export const aiService = {
  providers: {
    list: (query: ListQuery, signal?: AbortSignal) => api.list<Provider>('/ai/providers', query, { signal }),
    create: (v: ProviderFormValues) => api.post<Provider>('/ai/providers', providerBody(v)),
    update: (pid: string, v: Partial<ProviderFormValues>) => api.patch<Provider>(`/ai/providers/${id(pid)}`, providerBody(v)),
    setEnabled: (pid: string, enabled: boolean) => api.patch<Provider>(`/ai/providers/${id(pid)}`, { enabled }),
    remove: (pid: string) => api.delete(`/ai/providers/${id(pid)}`),
    test: (pid: string) => api.post<ConnectionTestResult>(`/ai/providers/${id(pid)}/test`),
  },
  models: {
    list: (query: ListQuery, signal?: AbortSignal) => api.list<AiModel>('/ai/models', query, { signal }),
    setEnabled: (mid: string, enabled: boolean) => api.patch<AiModel>(`/ai/models/${id(mid)}`, { enabled }),
    setPricing: (mid: string, v: PricingValues) => api.patch<AiModel>(`/ai/models/${id(mid)}`, v),
    setDefault: (mid: string, task: TaskType) => api.post<AiModel>(`/ai/models/${id(mid)}/default`, { task }),
  },
  prompts: {
    list: (query: ListQuery, signal?: AbortSignal) => api.list<Prompt>('/ai/prompts', query, { signal }),
    create: (v: PromptFormValues) => api.post<Prompt>('/ai/prompts', promptBody(v)),
    update: (pid: string, v: PromptFormValues) => api.patch<Prompt>(`/ai/prompts/${id(pid)}`, promptBody(v)),
    restore: (pid: string, version: number) => api.post<Prompt>(`/ai/prompts/${id(pid)}/restore`, { version }),
    remove: (pid: string) => api.delete(`/ai/prompts/${id(pid)}`),
  },
  usage: (range: UsageRange, signal?: AbortSignal) => api.get<UsageReport>('/ai/usage', { query: { range }, signal }),
};
