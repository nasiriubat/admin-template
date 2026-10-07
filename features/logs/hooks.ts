'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ListQuery } from '@nexus/api-client';
import { logsService } from './service';
import { LIVE_TAIL_INTERVAL_MS } from './types';

export const logKeys = {
  all: ['logs'] as const,
  list: (query: ListQuery) => ['logs', 'list', query] as const,
};

export function useLogs(query: ListQuery, live: boolean) {
  return useQuery({
    queryKey: logKeys.list(query),
    queryFn: ({ signal }) => logsService.list(query, signal),
    placeholderData: keepPreviousData,
    refetchInterval: live ? LIVE_TAIL_INTERVAL_MS : false,
  });
}
