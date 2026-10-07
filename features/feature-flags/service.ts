import type { ListQuery } from '@nexus/api-client';
import { api } from '../_shared/api';
import type { CreateFlagValues, UpdateFlagValues } from './schemas';
import type { FeatureFlag, FlagEnvironment } from './types';

const base = '/feature-flags';
const path = (id: string) => `${base}/${encodeURIComponent(id)}`;

export const featureFlagsService = {
  list: (query: ListQuery, signal?: AbortSignal) => api.list<FeatureFlag>(base, query, { signal }),
  create: (input: CreateFlagValues) => api.post<FeatureFlag>(base, input),
  update: (id: string, input: UpdateFlagValues) => api.patch<FeatureFlag>(path(id), input),
  toggle: (id: string, environment: FlagEnvironment, enabled: boolean) => api.post<FeatureFlag>(`${path(id)}/toggle`, { environment, enabled }),
  remove: (id: string) => api.delete(path(id)),
};
