import type { ListQuery } from '@nexus/api-client';
import { api } from '../_shared/api';
import type { BulkRetryInput } from './schemas';
import type { Job, JobStats } from './types';

export const jobsService = {
  list: (query: ListQuery, signal?: AbortSignal) => api.list<Job>('/jobs', query, { signal }),
  stats: (signal?: AbortSignal) => api.get<JobStats>('/jobs/stats', { signal }),
  retry: (id: string) => api.post<Job>(`/jobs/${encodeURIComponent(id)}/retry`),
  cancel: (id: string) => api.post<Job>(`/jobs/${encodeURIComponent(id)}/cancel`),
  retryMany: (input: BulkRetryInput) => api.post<{ affected: number }>('/jobs/retry', input),
};
