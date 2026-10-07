export type ServiceStatus = 'operational' | 'degraded' | 'outage';

export interface MetricSummary {
  value: number;
  /** Percentage change versus the previous period. */
  delta: number;
  series: number[];
}

export interface DashboardSummary {
  metrics: {
    activeUsers: MetricSummary;
    requests: MetricSummary;
    errorRate: MetricSummary;
    latencyMs: MetricSummary;
  };
  traffic: Array<{ date: string; requests: number; errors: number }>;
  roleDistribution: Array<{ name: string; value: number }>;
  activity: Array<{ id: string; actor: string; action: string; target: string; at: string }>;
  services: Array<{ id: string; name: string; status: ServiceStatus }>;
}
