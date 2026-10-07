'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ListQuery } from '@nexus/api-client';
import { auditService } from './service';

export const auditKeys = {
  all: ['audit'] as const,
  list: (query: ListQuery) => ['audit', 'list', query] as const,
};

export function useAuditEvents(query: ListQuery) {
  return useQuery({
    queryKey: auditKeys.list(query),
    queryFn: ({ signal }) => auditService.list(query, signal),
    placeholderData: keepPreviousData,
  });
}
