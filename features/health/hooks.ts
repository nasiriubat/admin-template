'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthService } from './service';
import { REFRESH_INTERVAL_MS } from './types';

export const healthKeys = { all: ['health'] as const, snapshot: ['health', 'snapshot'] as const };

export function useHealth(autoRefresh: boolean) {
  return useQuery({
    queryKey: healthKeys.snapshot,
    queryFn: ({ signal }) => healthService.snapshot(signal),
    refetchInterval: autoRefresh ? REFRESH_INTERVAL_MS : false,
  });
}

/** Re-renders on an interval so relative timestamps ("12 s ago") stay current. */
export function useNow(intervalMs = 5_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
