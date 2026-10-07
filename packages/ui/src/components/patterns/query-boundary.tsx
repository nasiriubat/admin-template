'use client';

import type { ReactNode } from 'react';
import { ErrorState } from './error-state';
import { UnauthorizedState } from './unauthorized-state';

/** Structural subset of TanStack Query's result so the UI package stays decoupled from it. */
export interface QueryLike<T> {
  data: T | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

export interface QueryBoundaryProps<T> {
  query: QueryLike<T>;
  /** Rendered while the first load is pending. */
  loading: ReactNode;
  /** Rendered when `isEmpty(data)` is true. */
  empty?: ReactNode;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => ReactNode;
}

/**
 * Enforces the five required page states in one place: loading, loaded, empty, error and
 * unauthorized. Auth failures (401/403) never show a generic error.
 */
export function QueryBoundary<T>({ query, loading, empty, isEmpty, children }: QueryBoundaryProps<T>) {
  if (query.isPending) {
    return (
      <div aria-busy="true" aria-live="polite">
        <span className="sr-only" role="status">
          Loading…
        </span>
        {loading}
      </div>
    );
  }

  if (query.isError) {
    const status = (query.error as { status?: number } | null)?.status;
    if (status === 401) return <UnauthorizedState reason="signed-out" size="page" />;
    if (status === 403) return <UnauthorizedState reason="forbidden" size="page" />;
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const data = query.data as T;
  if (empty && isEmpty?.(data)) return <>{empty}</>;
  return <>{children(data)}</>;
}
