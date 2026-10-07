'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesService } from './service';

export const roleKeys = {
  all: ['roles'] as const,
  list: ['roles', 'list'] as const,
  permissions: ['roles', 'permissions'] as const,
};

export const useRoles = () => useQuery({ queryKey: roleKeys.list, queryFn: ({ signal }) => rolesService.list(signal) });
export const usePermissionCatalog = () => useQuery({ queryKey: roleKeys.permissions, queryFn: ({ signal }) => rolesService.permissions(signal), staleTime: Infinity });

function useInvalidatingMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.list }) });
}

export const useCreateRole = () => useInvalidatingMutation(rolesService.create);
export const useUpdateRole = () => useInvalidatingMutation(({ id, patch }: { id: string; patch: Parameters<typeof rolesService.update>[1] }) => rolesService.update(id, patch));
export const useDeleteRole = () => useInvalidatingMutation(rolesService.remove);
