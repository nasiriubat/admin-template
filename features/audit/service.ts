import type { ListQuery } from '@nexus/api-client';
import { api } from '../_shared/api';
import type { AuditEvent } from './types';

export const auditService = {
  list: (query: ListQuery, signal?: AbortSignal) => api.list<AuditEvent>('/audit', query, { signal }),
  /** Every event matching the query (pages through the API) for CSV export. */
  async listAll(query: ListQuery): Promise<AuditEvent[]> {
    const all: AuditEvent[] = [];
    for (let page = 1; page <= 50; page += 1) {
      const result = await api.list<AuditEvent>('/audit', { ...query, page, pageSize: 100 });
      all.push(...result.items);
      if (page >= result.meta.pages) break;
    }
    return all;
  },
};
