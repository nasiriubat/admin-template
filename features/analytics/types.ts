export const ANALYTICS_RANGES = ['7d', '30d', '90d'] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export interface AnalyticsMetric {
  value: number;
  /** Percentage change versus the previous period of the same length. */
  delta: number;
  series: number[];
}

export interface TopPage {
  path: string;
  views: number;
  visitors: number;
  /** Bounce rate as a percentage (0 to 100). */
  bounceRate: number;
  /** Average time on page in seconds. */
  avgSeconds: number;
}

export interface AnalyticsReport {
  range: AnalyticsRange;
  metrics: {
    visitors: AnalyticsMetric;
    signups: AnalyticsMetric;
    /** Percentage (0 to 100). */
    conversionRate: AnalyticsMetric;
    /** Seconds. */
    avgSessionSeconds: AnalyticsMetric;
  };
  timeline: Array<{ date: string; visitors: number; signups: number }>;
  sessionsByWeekday: Array<{ day: string; sessions: number }>;
  sources: Array<{ name: string; value: number }>;
  topPages: TopPage[];
}
