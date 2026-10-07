import type { ListQuery } from '@nexus/api-client';
import { api } from '../_shared/api';
import type { FileItem, UploadInput } from './types';

export const filesService = {
  list: (query: ListQuery, signal?: AbortSignal) => api.list<FileItem>('/files', query, { signal }),
  upload: (input: UploadInput) => api.post<FileItem>('/files', input),
  rename: (id: string, name: string) => api.patch<FileItem>(`/files/${encodeURIComponent(id)}`, { name }),
  remove: (id: string) => api.delete(`/files/${encodeURIComponent(id)}`),
};
