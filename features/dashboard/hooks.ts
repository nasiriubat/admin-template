'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from './service';

export function useDashboardSummary() {
  return useQuery({ queryKey: ['dashboard', 'summary'], queryFn: ({ signal }) => dashboardService.summary(signal) });
}
