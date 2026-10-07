'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { analyticsService } from './service';
import type { AnalyticsRange } from './types';

export function useAnalyticsReport(range: AnalyticsRange) {
  return useQuery({
    queryKey: ['analytics', 'report', range],
    queryFn: ({ signal }) => analyticsService.report(range, signal),
    placeholderData: keepPreviousData,
  });
}
