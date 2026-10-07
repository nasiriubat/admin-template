import type { DayUptime, HealthService, Incident, ServiceStatus } from './types';
import { STATUS_META } from './types';

const SEVERITY: Record<ServiceStatus, number> = { operational: 0, degraded: 1, outage: 2 };

/** Worst status across services wins. An empty list is treated as operational. */
export function overallStatus(services: ReadonlyArray<Pick<HealthService, 'status'>>): ServiceStatus {
  return services.reduce<ServiceStatus>((worst, s) => (SEVERITY[s.status] > SEVERITY[worst] ? s.status : worst), 'operational');
}

export function overallHeadline(services: ReadonlyArray<Pick<HealthService, 'status' | 'name'>>): string {
  const status = overallStatus(services);
  if (status === 'operational') return 'All systems operational';
  const affected = services.filter((s) => s.status !== 'operational').length;
  const noun = affected === 1 ? 'service' : 'services';
  return status === 'outage' ? `Outage affecting ${affected} ${noun}` : `Degraded performance on ${affected} ${noun}`;
}

/** Uptime percentage as shown to people: never rounds 99.99 up to a misleading 100. */
export function formatUptime(pct: number): string {
  if (pct >= 100) return '100%';
  const floored = Math.floor(pct * 100 + 1e-9) / 100;
  return `${floored.toFixed(2)}%`;
}

export function describeDay(day: DayUptime): string {
  const label = new Date(`${day.date}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return `${label}: ${STATUS_META[day.status].label}, ${formatUptime(day.uptimePct)} uptime`;
}

/** Text alternative for the whole 30-day strip. */
export function summarizeHistory(name: string, history: ReadonlyArray<DayUptime>): string {
  const degraded = history.filter((d) => d.status === 'degraded').length;
  const outage = history.filter((d) => d.status === 'outage').length;
  if (degraded + outage === 0) return `${name}: operational on all ${history.length} days.`;
  const parts = [] as string[];
  if (outage) parts.push(`${outage} ${outage === 1 ? 'day' : 'days'} with an outage`);
  if (degraded) parts.push(`${degraded} ${degraded === 1 ? 'day' : 'days'} degraded`);
  return `${name}: ${parts.join(' and ')} in the last ${history.length} days.`;
}

export const isOpen = (incident: Pick<Incident, 'status'>) => incident.status !== 'resolved';

export function splitIncidents(incidents: ReadonlyArray<Incident>) {
  const byStart = (a: Incident, b: Incident) => b.startedAt.localeCompare(a.startedAt);
  return {
    open: incidents.filter(isOpen).sort(byStart),
    resolved: incidents.filter((i) => !isOpen(i)).sort(byStart),
  };
}

export function incidentDurationMinutes(incident: Pick<Incident, 'startedAt' | 'resolvedAt'>, now = Date.now()): number {
  const end = incident.resolvedAt ? Date.parse(incident.resolvedAt) : now;
  return Math.max(0, Math.round((end - Date.parse(incident.startedAt)) / 60_000));
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
