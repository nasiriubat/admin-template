'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListQuery, Paginated } from '@nexus/api-client';
import { applyToggle, patchFlagInPage } from './flag-utils';
import { featureFlagsService } from './service';
import type { FeatureFlag, FlagEnvironment } from './types';

export const flagKeys = {
  all: ['feature-flags'] as const,
  list: (query: ListQuery) => ['feature-flags', 'list', query] as const,
};

export function useFeatureFlags(query: ListQuery) {
  return useQuery({
    queryKey: flagKeys.list(query),
    queryFn: ({ signal }) => featureFlagsService.list(query, signal),
    placeholderData: keepPreviousData,
  });
}

function useInvalidatingMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: flagKeys.all }) });
}

export const useCreateFlag = () => useInvalidatingMutation(featureFlagsService.create);
export const useUpdateFlag = () => useInvalidatingMutation(({ id, input }: { id: string; input: Parameters<typeof featureFlagsService.update>[1] }) => featureFlagsService.update(id, input));
export const useDeleteFlag = () => useInvalidatingMutation(featureFlagsService.remove);

type Snapshot = Array<[readonly unknown[], Paginated<FeatureFlag> | undefined]>;

/** Optimistic per-environment toggle: flips the switch immediately, rolls back if the request fails. */
export function useToggleFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, environment, enabled }: { id: string; environment: FlagEnvironment; enabled: boolean }) =>
      featureFlagsService.toggle(id, environment, enabled),
    onMutate: async ({ id, environment, enabled }) => {
      await qc.cancelQueries({ queryKey: flagKeys.all });
      const previous: Snapshot = qc.getQueriesData<Paginated<FeatureFlag>>({ queryKey: flagKeys.all });
      qc.setQueriesData<Paginated<FeatureFlag>>({ queryKey: flagKeys.all }, (page) =>
        patchFlagInPage(page, id, (f) => applyToggle(f, environment, enabled)),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      context?.previous.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: flagKeys.all }),
  });
}
