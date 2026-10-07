'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListQuery } from '@nexus/api-client';
import { knowledgeService } from './service';

export const knowledgeKeys = {
  all: ['knowledge'] as const,
  documents: (query: ListQuery) => ['knowledge', 'documents', query] as const,
  sources: (query: ListQuery) => ['knowledge', 'sources', query] as const,
};

export function useKnowledgeDocuments(query: ListQuery) {
  return useQuery({
    queryKey: knowledgeKeys.documents(query),
    queryFn: ({ signal }) => knowledgeService.listDocuments(query, signal),
    placeholderData: keepPreviousData,
  });
}

export function useKnowledgeSources(query: ListQuery) {
  return useQuery({
    queryKey: knowledgeKeys.sources(query),
    queryFn: ({ signal }) => knowledgeService.listSources(query, signal),
    placeholderData: keepPreviousData,
  });
}

/** Every knowledge mutation invalidates all knowledge queries (documents counts depend on sources). */
function useInvalidatingMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: knowledgeKeys.all }) });
}

export const useUploadDocument = () => useInvalidatingMutation(knowledgeService.uploadDocument);
export const useReindexDocuments = () => useInvalidatingMutation(knowledgeService.reindexDocuments);
export const useRemoveDocument = () => useInvalidatingMutation(knowledgeService.removeDocument);
export const useCreateSource = () => useInvalidatingMutation(knowledgeService.createSource);
export const useSetSourcePaused = () => useInvalidatingMutation(({ id, paused }: { id: string; paused: boolean }) => knowledgeService.setSourcePaused(id, paused));
export const useSyncSource = () => useInvalidatingMutation(knowledgeService.syncSource);
export const useRemoveSource = () => useInvalidatingMutation(knowledgeService.removeSource);
