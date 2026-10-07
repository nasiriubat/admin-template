import { createRng, minutesAgo } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import type { DashboardSummary } from './types';

function build(): DashboardSummary {
  const rng = createRng(77);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86_400_000);
    const requests = 42_000 + rng.int(-6000, 9000) + i * 900;
    return { date: d.toISOString().slice(0, 10), requests, errors: Math.round(requests * (0.004 + rng.next() * 0.006)) };
  });
  const series = (base: number, spread: number) => Array.from({ length: 12 }, () => Math.round(base + rng.int(-spread, spread)));
  return {
    metrics: {
      activeUsers: { value: 14290, delta: 12.4, series: series(14000, 900) },
      requests: { value: days.reduce((s, d) => s + d.requests, 0), delta: 8.1, series: series(46000, 4000) },
      errorRate: { value: 0.72, delta: -0.14, series: series(70, 12).map((v) => v / 100) },
      latencyMs: { value: 142, delta: -4.6, series: series(150, 18) },
    },
    traffic: days,
    roleDistribution: [
      { name: 'Viewers', value: 29 },
      { name: 'Editors', value: 12 },
      { name: 'Admins', value: 6 },
      { name: 'Super Admins', value: 1 },
    ],
    activity: [
      { id: 'a1', actor: 'Avery Morgan', action: 'invited', target: 'riley.nguyen@example.com', at: minutesAgo(12) },
      { id: 'a2', actor: 'Jordan Lee', action: 'updated role of', target: 'Sam Rivera', at: minutesAgo(47) },
      { id: 'a3', actor: 'System', action: 'rotated API key', target: 'Production ingest', at: minutesAgo(130) },
      { id: 'a4', actor: 'Avery Morgan', action: 'enabled feature flag', target: 'new-billing-flow', at: minutesAgo(260) },
      { id: 'a5', actor: 'Morgan Tanaka', action: 'signed in from', target: 'Helsinki, FI', at: minutesAgo(410) },
    ],
    services: [
      { id: 'api', name: 'API', status: 'operational' },
      { id: 'db', name: 'Database', status: 'operational' },
      { id: 'queue', name: 'Job queue', status: 'degraded' },
      { id: 'storage', name: 'File storage', status: 'operational' },
    ],
  };
}

mockRouter.on('GET', '/dashboard/summary', () => build());
