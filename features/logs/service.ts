import type { ListQuery } from '@nexus/api-client';
import { listQueryToParams } from '@nexus/api-client';
import { api } from '../_shared/api';
import type { LogEntry } from './types';

export const logsService = {
  list: (query: ListQuery, signal?: AbortSignal) => api.list<LogEntry>('/logs', query, { signal }),
  /** Every entry matching the filters (not just the current page), newest first. */
  exportAll: (query: ListQuery) => api.get<LogEntry[]>('/logs/export', { query: listQueryToParams(query) }),
};
