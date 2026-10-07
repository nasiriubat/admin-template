import { api } from '../_shared/api';
import type { Notification } from './types';

export const notificationsService = {
  list: (signal?: AbortSignal) => api.get<Notification[]>('/notifications', { signal }),
  setRead: (id: string, read: boolean) => api.patch<Notification>(`/notifications/${encodeURIComponent(id)}`, { read }),
  markAllRead: () => api.post<{ affected: number }>('/notifications/read-all'),
  remove: (id: string) => api.delete(`/notifications/${encodeURIComponent(id)}`),
};
