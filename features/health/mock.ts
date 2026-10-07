import { createRng, daysAgo, minutesAgo } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import type { DayUptime, HealthService, HealthSnapshot, Incident, ServiceStatus } from './types';

const rng = createRng(20260330);

interface ServiceSeed {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseLatency: number;
  /** Day offsets (0 = today) with a degraded or outage day. */
  incidentsOn: Record<number, ServiceStatus>;
}

const SERVICES: ServiceSeed[] = [
  { id: 'api', name: 'API', description: 'Public REST endpoints and gateway', icon: 'Globe', baseLatency: 84, incidentsOn: { 12: 'degraded' } },
  { id: 'database', name: 'Database', description: 'Primary PostgreSQL cluster', icon: 'Database', baseLatency: 12, incidentsOn: { 21: 'outage' } },
  { id: 'cache', name: 'Cache', description: 'Redis session and query cache', icon: 'Zap', baseLatency: 3, incidentsOn: {} },
  { id: 'queue', name: 'Queue', description: 'Background job broker', icon: 'Layers', baseLatency: 18, incidentsOn: { 5: 'degraded' } },
  { id: 'storage', name: 'Storage', description: 'Object storage for uploads and exports', icon: 'Folder', baseLatency: 46, incidentsOn: {} },
  { id: 'email', name: 'Email provider', description: 'Transactional email delivery', icon: 'Mail', baseLatency: 210, incidentsOn: { 9: 'degraded', 0: 'degraded' } },
  { id: 'search', name: 'Search', description: 'Full-text search index', icon: 'Search', baseLatency: 61, incidentsOn: { 17: 'degraded' } },
];

const dayStatusPct: Record<ServiceStatus, () => number> = {
  operational: () => 99.9 + rng.int(0, 10) / 100,
  degraded: () => 97 + rng.int(0, 150) / 100,
  outage: () => 88 + rng.int(0, 600) / 100,
};

function buildHistory(seed: ServiceSeed): DayUptime[] {
  return Array.from({ length: 30 }, (_, i) => {
    const offset = 29 - i;
    const status = seed.incidentsOn[offset] ?? 'operational';
    return { date: daysAgo(offset).slice(0, 10), status, uptimePct: Math.min(100, Number(dayStatusPct[status]().toFixed(2))) };
  });
}

const histories = new Map(SERVICES.map((s) => [s.id, buildHistory(s)]));

const incidents: Incident[] = [
  {
    id: 'inc-2041',
    title: 'Delayed transactional email delivery',
    serviceIds: ['email'],
    status: 'monitoring',
    severity: 'degraded',
    startedAt: minutesAgo(95),
    resolvedAt: null,
    updates: [
      { at: minutesAgo(18), status: 'monitoring', message: 'Provider has cleared the backlog. We are watching delivery times for the next hour.' },
      { at: minutesAgo(52), status: 'identified', message: 'The upstream email provider is throttling our sending domain. We switched to the secondary route.' },
      { at: minutesAgo(95), status: 'investigating', message: 'Password reset and invite emails are arriving more than 10 minutes late.' },
    ],
  },
  {
    id: 'inc-2037',
    title: 'Search results missing recent records',
    serviceIds: ['search'],
    status: 'resolved',
    severity: 'degraded',
    startedAt: daysAgo(17),
    resolvedAt: new Date(Date.parse(daysAgo(17)) + 140 * 60_000).toISOString(),
    updates: [
      { at: new Date(Date.parse(daysAgo(17)) + 140 * 60_000).toISOString(), status: 'resolved', message: 'Index rebuild finished and lag returned to normal.' },
      { at: new Date(Date.parse(daysAgo(17)) + 45 * 60_000).toISOString(), status: 'identified', message: 'An indexing worker was stuck after a deploy. A full rebuild is running.' },
      { at: daysAgo(17), status: 'investigating', message: 'New records take several minutes to appear in search.' },
    ],
  },
  {
    id: 'inc-2029',
    title: 'Database failover caused write errors',
    serviceIds: ['database', 'api'],
    status: 'resolved',
    severity: 'outage',
    startedAt: daysAgo(21),
    resolvedAt: new Date(Date.parse(daysAgo(21)) + 38 * 60_000).toISOString(),
    updates: [
      { at: new Date(Date.parse(daysAgo(21)) + 38 * 60_000).toISOString(), status: 'resolved', message: 'Replica promoted and connections recovered. No data was lost.' },
      { at: new Date(Date.parse(daysAgo(21)) + 14 * 60_000).toISOString(), status: 'identified', message: 'The primary node lost its disk volume. Failover to the replica is in progress.' },
      { at: daysAgo(21), status: 'investigating', message: 'Write requests are failing with timeouts.' },
    ],
  },
  {
    id: 'inc-2018',
    title: 'Elevated API latency',
    serviceIds: ['api'],
    status: 'resolved',
    severity: 'degraded',
    startedAt: daysAgo(12),
    resolvedAt: new Date(Date.parse(daysAgo(12)) + 65 * 60_000).toISOString(),
    updates: [
      { at: new Date(Date.parse(daysAgo(12)) + 65 * 60_000).toISOString(), status: 'resolved', message: 'Autoscaling caught up with the traffic spike.' },
      { at: daysAgo(12), status: 'investigating', message: 'The 95th percentile response time has doubled.' },
    ],
  },
];

function buildService(seed: ServiceSeed): HealthService {
  const history = histories.get(seed.id)!;
  const open = incidents.find((i) => i.status !== 'resolved' && i.serviceIds.includes(seed.id));
  const status: ServiceStatus = open ? open.severity : 'operational';
  const jitter = Math.round(Math.sin(Date.now() / 20_000 + seed.baseLatency) * seed.baseLatency * 0.12);
  const latencyMs = Math.max(1, Math.round(seed.baseLatency * (status === 'degraded' ? 2.4 : 1)) + jitter);
  const uptimePct = history.reduce((sum, d) => sum + d.uptimePct, 0) / history.length;
  const today = history[history.length - 1];
  return {
    id: seed.id,
    name: seed.name,
    description: seed.description,
    icon: seed.icon,
    status,
    latencyMs,
    uptimePct: Number(uptimePct.toFixed(3)),
    history: [...history.slice(0, -1), { ...today, status: status === 'operational' ? today.status : status }],
  };
}

mockRouter.on('GET', '/health', (): HealthSnapshot => ({
  checkedAt: new Date().toISOString(),
  services: SERVICES.map(buildService),
  incidents,
}));
