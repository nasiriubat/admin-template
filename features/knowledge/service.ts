import type { ListQuery } from '@nexus/api-client';
import { api } from '../_shared/api';
import type { KnowledgeDocument, KnowledgeSource, SourceInput, UploadDocumentInput } from './types';

const enc = encodeURIComponent;

export const knowledgeService = {
  listDocuments: (query: ListQuery, signal?: AbortSignal) => api.list<KnowledgeDocument>('/knowledge/documents', query, { signal }),
  uploadDocument: (input: UploadDocumentInput) => api.post<KnowledgeDocument>('/knowledge/documents', input),
  reindexDocuments: (ids: string[]) => api.post<{ affected: number }>('/knowledge/documents/reindex', { ids }),
  removeDocument: (id: string) => api.delete(`/knowledge/documents/${enc(id)}`),
  listSources: (query: ListQuery, signal?: AbortSignal) => api.list<KnowledgeSource>('/knowledge/sources', query, { signal }),
  createSource: (input: SourceInput) => api.post<KnowledgeSource>('/knowledge/sources', input),
  setSourcePaused: (id: string, paused: boolean) => api.patch<KnowledgeSource>(`/knowledge/sources/${enc(id)}`, { paused }),
  syncSource: (id: string) => api.post<KnowledgeSource>(`/knowledge/sources/${enc(id)}/sync`),
  removeSource: (id: string) => api.delete(`/knowledge/sources/${enc(id)}`),
};
