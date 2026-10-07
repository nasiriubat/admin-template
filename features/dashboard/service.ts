import { api } from '../_shared/api';
import type { DashboardSummary } from './types';

export const dashboardService = {
  summary: (signal?: AbortSignal) => api.get<DashboardSummary>('/dashboard/summary', { signal }),
};
