'use client';

import type { ReactNode } from 'react';
import { ErrorState } from '../patterns/error-state';
import { EmptyState } from '../patterns/empty-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

/** Card shell for any chart with the loading / error / empty states built in. */
export function ChartCard({
  title,
  description,
  actions,
  loading,
  error,
  onRetry,
  empty,
  height = 280,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  empty?: boolean;
  height?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className} aria-busy={loading || undefined}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {actions}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div role="status" aria-label={`Loading ${title}`} style={{ height }}>
            <Skeleton className="h-full w-full" />
          </div>
        ) : error ? (
          <div style={{ minHeight: height }} className="grid place-items-center">
            <ErrorState error={error} onRetry={onRetry} />
          </div>
        ) : empty ? (
          <div style={{ minHeight: height }} className="grid place-items-center">
            <EmptyState icon="BarChart3" title="No data for this period" description="Try a wider date range." />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
