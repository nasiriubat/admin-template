import { api } from '../_shared/api';
import type { SettingsCategory, WorkspaceSettings } from './types';

export const settingsService = {
  get: (signal?: AbortSignal) => api.get<WorkspaceSettings>('/settings', { signal }),
  save: <C extends SettingsCategory>(category: C, values: WorkspaceSettings[C]) => api.put<WorkspaceSettings[C]>(`/settings/${category}`, values),
  resetDemoData: () => api.post<{ reset: boolean }>('/settings/reset-demo'),
  deleteWorkspace: () => api.delete<{ deleted: boolean }>('/settings/workspace'),
};
