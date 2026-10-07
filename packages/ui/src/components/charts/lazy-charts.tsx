'use client';

import { lazy, Suspense, type ComponentType } from 'react';
import { Skeleton } from '../ui/skeleton';
import type { DonutChartProps, SparklineProps, TimeSeriesChartProps } from './chart-types';

/*
 * Recharts is ~110 kB gzipped. These wrappers load it on demand so pages render their shell,
 * metrics and tables immediately and the chart code arrives (and caches) separately.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asComponent = <P,>(c: unknown) => c as ComponentType<P & any>;

const TimeSeriesImpl = lazy(() => import('./time-series-chart').then((m) => ({ default: asComponent<TimeSeriesChartProps<object>>(m.TimeSeriesChartImpl) })));
const DonutImpl = lazy(() => import('./donut-chart').then((m) => ({ default: asComponent<DonutChartProps>(m.DonutChartImpl) })));
const SparklineLazy = lazy(() => import('./sparkline').then((m) => ({ default: asComponent<SparklineProps>(m.SparklineImpl) })));

function ChartFallback({ height }: { height: number }) {
  return (
    <div role="status" aria-label="Loading chart" style={{ height }}>
      <Skeleton className="h-full w-full" />
    </div>
  );
}

export function TimeSeriesChart<T extends object>(props: TimeSeriesChartProps<T>) {
  return (
    <Suspense fallback={<ChartFallback height={props.height ?? 280} />}>
      <TimeSeriesImpl {...(props as unknown as TimeSeriesChartProps<object>)} />
    </Suspense>
  );
}

export function DonutChart(props: DonutChartProps) {
  return (
    <Suspense fallback={<ChartFallback height={props.height ?? 220} />}>
      <DonutImpl {...props} />
    </Suspense>
  );
}

export function Sparkline(props: SparklineProps) {
  return (
    <Suspense fallback={<div style={{ height: props.height ?? 36 }} className="mt-3" aria-hidden="true" />}>
      <SparklineLazy {...props} />
    </Suspense>
  );
}
