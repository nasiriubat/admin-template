'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { ListQuery } from '@nexus/api-client';
import type { CreateApiKeyValues } from './schemas';
import { apiKeysService } from './service';
import type { CreatedApiKey } from './types';

export const apiKeyKeys = {
  all: ['api-keys'] as const,
  list: (query: ListQuery) => ['api-keys', 'list', query] as const,
};

export function useApiKeys(query: ListQuery) {
  return useQuery({
    queryKey: apiKeyKeys.list(query),
    queryFn: ({ signal }) => apiKeysService.list(query, signal),
    placeholderData: keepPreviousData,
  });
}

/**
 * Deliberately NOT a `useMutation`: mutation results are retained in TanStack's mutation cache,
 * and the one-time secret must live only in the component state that shows it.
 */
export function useCreateApiKey() {
  const qc = useQueryClient();
  const [isPending, setPending] = useState(false);
  const create = useCallback(
    async (values: CreateApiKeyValues): Promise<CreatedApiKey> => {
      setPending(true);
      try {
        const created = await apiKeysService.create(values);
        await qc.invalidateQueries({ queryKey: apiKeyKeys.all });
        return created;
      } finally {
        setPending(false);
      }
    },
    [qc],
  );
  return { create, isPending };
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: apiKeysService.revoke, onSuccess: () => qc.invalidateQueries({ queryKey: apiKeyKeys.all }) });
}
