import type { ListQuery } from '@nexus/api-client';
import { api } from '../_shared/api';
import type { UserFormValues } from './schemas';
import type { BulkUserAction, User } from './types';

export const usersService = {
  list: (query: ListQuery, signal?: AbortSignal) => api.list<User>('/users', query, { signal }),
  get: (id: string, signal?: AbortSignal) => api.get<User>(`/users/${encodeURIComponent(id)}`, { signal }),
  create: (input: UserFormValues) => api.post<User>('/users', input),
  update: (id: string, input: Partial<UserFormValues>) => api.patch<User>(`/users/${encodeURIComponent(id)}`, input),
  remove: (id: string) => api.delete(`/users/${encodeURIComponent(id)}`),
  bulk: (ids: string[], action: BulkUserAction) => api.post<{ affected: number }>('/users/bulk', { ids, action }),
};
