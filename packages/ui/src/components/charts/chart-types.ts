import type { ChartTone } from './chart-theme';

// Prop types only (no runtime): shared by the lazy wrappers and the Recharts implementations.

export interface ChartSeries {
  key: string;
  label: string;
  tone?: ChartTone;
}

export interface TimeSeriesChartProps<T extends object> {
  data: T[];
  xKey: keyof T & string;
  series: ChartSeries[];
  variant?: 'area' | 'line' | 'bar';
  stacked?: boolean;
  height?: number;
  valueFormatter?: (value: number) => string;
  xFormatter?: (value: string) => string;
  /** Accessible summary read by screen readers, e.g. "Requests per day, last 14 days". */
  summary: string;
}

export interface DonutDatum {
  name: string;
  value: number;
  tone?: ChartTone;
}

export interface DonutChartProps {
  data: DonutDatum[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
  summary: string;
  valueFormatter?: (v: number) => string;
}

/** Tiny trend line for metric cards. Decorative: the metric value carries the information. */
export interface SparklineProps {
  values: number[];
  tone?: ChartTone;
  height?: number;
}
