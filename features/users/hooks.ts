'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListQuery } from '@nexus/api-client';
import { usersService } from './service';

export const userKeys = {
  all: ['users'] as const,
  list: (query: ListQuery) => ['users', 'list', query] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
};

export function useUsers(query: ListQuery) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: ({ signal }) => usersService.list(query, signal),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string) {
  return useQuery({ queryKey: userKeys.detail(id), queryFn: ({ signal }) => usersService.get(id, signal) });
}

/** All mutations invalidate every users query so lists and detail pages stay consistent. */
function useInvalidatingMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }) });
}

export const useCreateUser = () => useInvalidatingMutation(usersService.create);
export const useUpdateUser = () => useInvalidatingMutation(({ id, input }: { id: string; input: Parameters<typeof usersService.update>[1] }) => usersService.update(id, input));
export const useDeleteUser = () => useInvalidatingMutation(usersService.remove);
export const useBulkUsers = () => useInvalidatingMutation(({ ids, action }: { ids: string[]; action: Parameters<typeof usersService.bulk>[1] }) => usersService.bulk(ids, action));
