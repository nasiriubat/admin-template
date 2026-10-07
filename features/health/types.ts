export type ServiceStatus = 'operational' | 'degraded' | 'outage';
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

export interface DayUptime {
  /** ISO date (yyyy-mm-dd). */
  date: string;
  status: ServiceStatus;
  uptimePct: number;
}

export interface HealthService {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: ServiceStatus;
  latencyMs: number;
  /** 30-day uptime percentage. */
  uptimePct: number;
  /** Oldest first, 30 entries. */
  history: DayUptime[];
}

export interface IncidentUpdate {
  at: string;
  status: IncidentStatus;
  message: string;
}

export interface Incident {
  id: string;
  title: string;
  serviceIds: string[];
  status: IncidentStatus;
  severity: Exclude<ServiceStatus, 'operational'>;
  startedAt: string;
  resolvedAt: string | null;
  /** Newest first. */
  updates: IncidentUpdate[];
}

export interface HealthSnapshot {
  checkedAt: string;
  services: HealthService[];
  incidents: Incident[];
}

export const STATUS_META: Record<ServiceStatus, { label: string; variant: 'success' | 'warning' | 'danger'; icon: string }> = {
  operational: { label: 'Operational', variant: 'success', icon: 'CheckCircle2' },
  degraded: { label: 'Degraded', variant: 'warning', icon: 'AlertTriangle' },
  outage: { label: 'Outage', variant: 'danger', icon: 'AlertCircle' },
};

export const INCIDENT_STATUS_LABEL: Record<IncidentStatus, string> = {
  investigating: 'Investigating',
  identified: 'Identified',
  monitoring: 'Monitoring',
  resolved: 'Resolved',
};

export const REFRESH_INTERVAL_MS = 30_000;
