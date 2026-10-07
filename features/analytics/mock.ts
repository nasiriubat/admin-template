import { createRng } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import { parseRange, percentChange, RANGE_DAYS, weekdayTotals } from './helpers';
import type { AnalyticsReport, AnalyticsRange, TopPage } from './types';

const PAGES = ['/', '/pricing', '/features', '/docs/getting-started', '/blog/launch-notes', '/signup', '/login', '/changelog', '/docs/api', '/contact'];

function build(range: AnalyticsRange): AnalyticsReport {
  const days = RANGE_DAYS[range];
  const rng = createRng(4242 + days);
  const total = days * 2;
  const raw = Array.from({ length: total }, (_, i) => {
    const date = new Date(Date.now() - (total - 1 - i) * 86_400_000).toISOString().slice(0, 10);
    const visitors = 3200 + i * 12 + rng.int(-500, 700);
    return { date, visitors, signups: Math.round(visitors * (0.03 + rng.next() * 0.015)) };
  });
  const prev = raw.slice(0, days);
  const timeline = raw.slice(days);
  const sum = (rows: typeof raw, k: 'visitors' | 'signups') => rows.reduce((s, r) => s + r[k], 0);
  const visitors = sum(timeline, 'visitors');
  const signups = sum(timeline, 'signups');
  const conv = (signups / visitors) * 100;
  const prevConv = (sum(prev, 'signups') / sum(prev, 'visitors')) * 100;
  const sessionSeconds = 182 + rng.int(-10, 25);
  const prevSession = 176 + rng.int(-10, 10);
  const tail = (rows: number[]) => rows.slice(-12);
  const topPages: TopPage[] = PAGES.map((path) => {
    const views = rng.int(1200, 18000) * (days / 30);
    return { path, views: Math.round(views), visitors: Math.round(views * (0.55 + rng.next() * 0.25)), bounceRate: Math.round((25 + rng.next() * 45) * 10) / 10, avgSeconds: rng.int(35, 280) };
  });
  const sourceTotal = visitors;
  const shares = [0.38, 0.27, 0.17, 0.11, 0.07];
  const names = ['Organic search', 'Direct', 'Referral', 'Social', 'Email'];
  return {
    range,
    metrics: {
      visitors: { value: visitors, delta: percentChange(visitors, sum(prev, 'visitors')), series: tail(timeline.map((r) => r.visitors)) },
      signups: { value: signups, delta: percentChange(signups, sum(prev, 'signups')), series: tail(timeline.map((r) => r.signups)) },
      conversionRate: { value: Math.round(conv * 100) / 100, delta: percentChange(conv, prevConv), series: tail(timeline.map((r) => (r.signups / r.visitors) * 100)) },
      avgSessionSeconds: { value: sessionSeconds, delta: percentChange(sessionSeconds, prevSession), series: tail(timeline.map(() => 170 + rng.int(0, 30))) },
    },
    timeline,
    sessionsByWeekday: weekdayTotals(timeline.map((r) => ({ date: r.date, value: Math.round(r.visitors * 1.3) }))),
    sources: names.map((name, i) => ({ name, value: Math.round(sourceTotal * shares[i]) })),
    topPages: topPages.sort((a, b) => b.views - a.views),
  };
}

mockRouter.on('GET', '/analytics/report', ({ query }) => build(parseRange(query.range)));
