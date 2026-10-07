'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListQuery } from '@nexus/api-client';
import { jobsService } from './service';
import { REFRESH_INTERVAL_MS } from './types';

export const jobKeys = {
  all: ['jobs'] as const,
  list: (query: ListQuery) => ['jobs', 'list', query] as const,
  stats: ['jobs', 'stats'] as const,
};

export function useJobs(query: ListQuery) {
  return useQuery({
    queryKey: jobKeys.list(query),
    queryFn: ({ signal }) => jobsService.list(query, signal),
    placeholderData: keepPreviousData,
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}

export function useJobStats() {
  return useQuery({
    queryKey: jobKeys.stats,
    queryFn: ({ signal }) => jobsService.stats(signal),
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}

/** Every mutation refreshes the list and the counters together. */
function useInvalidatingMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.all }) });
}

export const useRetryJob = () => useInvalidatingMutation(jobsService.retry);
export const useCancelJob = () => useInvalidatingMutation(jobsService.cancel);
export const useRetryJobs = () => useInvalidatingMutation(jobsService.retryMany);
