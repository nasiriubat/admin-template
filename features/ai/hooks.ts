'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListQuery } from '@nexus/api-client';
import { aiService } from './service';
import type { UsageRange } from './types';

export const aiKeys = {
  providers: ['ai', 'providers'] as const,
  models: ['ai', 'models'] as const,
  prompts: ['ai', 'prompts'] as const,
  usage: (range: UsageRange) => ['ai', 'usage', range] as const,
};

/** Models embed their provider's name, so provider changes also refresh models. */
function useInvalidatingMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>, keys: ReadonlyArray<readonly string[]>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => Promise.all(keys.map((queryKey) => qc.invalidateQueries({ queryKey }))) });
}

export const useProviders = (query: ListQuery) =>
  useQuery({ queryKey: [...aiKeys.providers, query], queryFn: ({ signal }) => aiService.providers.list(query, signal), placeholderData: keepPreviousData });
export const useCreateProvider = () => useInvalidatingMutation(aiService.providers.create, [aiKeys.providers]);
export const useUpdateProvider = () => useInvalidatingMutation(({ id, input }: { id: string; input: Parameters<typeof aiService.providers.update>[1] }) => aiService.providers.update(id, input), [aiKeys.providers]);
export const useSetProviderEnabled = () => useInvalidatingMutation(({ id, enabled }: { id: string; enabled: boolean }) => aiService.providers.setEnabled(id, enabled), [aiKeys.providers, aiKeys.models]);
export const useDeleteProvider = () => useInvalidatingMutation(aiService.providers.remove, [aiKeys.providers, aiKeys.models]);
export const useTestProvider = () => useInvalidatingMutation(aiService.providers.test, [aiKeys.providers]);

export const useModels = (query: ListQuery) =>
  useQuery({ queryKey: [...aiKeys.models, query], queryFn: ({ signal }) => aiService.models.list(query, signal), placeholderData: keepPreviousData });
export const useSetModelEnabled = () => useInvalidatingMutation(({ id, enabled }: { id: string; enabled: boolean }) => aiService.models.setEnabled(id, enabled), [aiKeys.models]);
export const useSetModelPricing = () => useInvalidatingMutation(({ id, input }: { id: string; input: Parameters<typeof aiService.models.setPricing>[1] }) => aiService.models.setPricing(id, input), [aiKeys.models]);
export const useSetDefaultModel = () => useInvalidatingMutation(({ id, task }: { id: string; task: Parameters<typeof aiService.models.setDefault>[1] }) => aiService.models.setDefault(id, task), [aiKeys.models]);

export const usePrompts = (query: ListQuery) =>
  useQuery({ queryKey: [...aiKeys.prompts, query], queryFn: ({ signal }) => aiService.prompts.list(query, signal), placeholderData: keepPreviousData });
export const useCreatePrompt = () => useInvalidatingMutation(aiService.prompts.create, [aiKeys.prompts]);
export const useUpdatePrompt = () => useInvalidatingMutation(({ id, input }: { id: string; input: Parameters<typeof aiService.prompts.update>[1] }) => aiService.prompts.update(id, input), [aiKeys.prompts]);
export const useRestorePrompt = () => useInvalidatingMutation(({ id, version }: { id: string; version: number }) => aiService.prompts.restore(id, version), [aiKeys.prompts]);
export const useDeletePrompt = () => useInvalidatingMutation(aiService.prompts.remove, [aiKeys.prompts]);

export const useUsage = (range: UsageRange) => useQuery({ queryKey: aiKeys.usage(range), queryFn: ({ signal }) => aiService.usage(range, signal) });
