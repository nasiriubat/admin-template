import type { ListQuery } from '@nexus/api-client';
import { api } from '../_shared/api';
import { toCreateRequest } from './key-utils';
import type { CreateApiKeyValues } from './schemas';
import type { ApiKey, CreatedApiKey } from './types';

export const apiKeysService = {
  list: (query: ListQuery, signal?: AbortSignal) => api.list<ApiKey>('/api-keys', query, { signal }),
  create: (values: CreateApiKeyValues) => api.post<CreatedApiKey>('/api-keys', toCreateRequest(values)),
  revoke: (id: string) => api.post<ApiKey>(`/api-keys/${encodeURIComponent(id)}/revoke`),
};
