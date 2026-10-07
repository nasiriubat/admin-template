import { api } from '../_shared/api';
import type { AnalyticsRange, AnalyticsReport } from './types';

export const analyticsService = {
  report: (range: AnalyticsRange, signal?: AbortSignal) => api.get<AnalyticsReport>('/analytics/report', { query: { range }, signal }),
};
