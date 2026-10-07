import { api } from '../_shared/api';
import type { CreateRoleValues } from './schemas';
import type { PermissionDefinition, Role } from './types';

export const rolesService = {
  list: (signal?: AbortSignal) => api.get<Role[]>('/roles', { signal }),
  permissions: (signal?: AbortSignal) => api.get<PermissionDefinition[]>('/permissions', { signal }),
  create: (input: CreateRoleValues) => api.post<Role>('/roles', input),
  update: (id: string, patch: Partial<Pick<Role, 'permissions' | 'name' | 'description'>>) => api.patch<Role>(`/roles/${encodeURIComponent(id)}`, patch),
  remove: (id: string) => api.delete(`/roles/${encodeURIComponent(id)}`),
};
