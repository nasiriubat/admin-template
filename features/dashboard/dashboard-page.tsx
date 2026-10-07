'use client';

import Link from 'next/link';
import { useAuth } from '@nexus/auth';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartCard,
  DonutChart,
  formatCompact,
  formatDate,
  formatRelative,
  MetricCard,
  PageContainer,
  PageHeader,
  Skeleton,
  Sparkline,
  TimeSeriesChart,
  UnauthorizedState,
  ErrorState,
} from '@nexus/ui';
import { useDashboardSummary } from './hooks';
import type { ServiceStatus } from './types';

const statusMeta: Record<ServiceStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  operational: { label: 'Operational', variant: 'success' },
  degraded: { label: 'Degraded', variant: 'warning' },
  outage: { label: 'Outage', variant: 'danger' },
};

export function DashboardPage() {
  const { user, can } = useAuth();
  const query = useDashboardSummary();
  const { data, isPending } = query;
  const status = (query.error as { status?: number } | null)?.status;

  if (query.isError && status === 403) return <UnauthorizedState size="page" />;
  const firstName = user?.name.split(' ')[0];

  return (
    <PageContainer>
      <PageHeader title={firstName ? `Welcome back, ${firstName}` : 'Dashboard'} description="Here’s what’s happening across your workspace." />

      {query.isError ? (
        <Card>
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        </Card>
      ) : (
        <>
          <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Active users" icon="Users" loading={isPending} value={data && formatCompact(data.metrics.activeUsers.value)} delta={data && `${data.metrics.activeUsers.delta > 0 ? '+' : ''}${data.metrics.activeUsers.delta}%`} deltaLabel="vs last 30 days">
              {data && <Sparkline values={data.metrics.activeUsers.series} />}
            </MetricCard>
            <MetricCard label="Requests (14d)" icon="Activity" loading={isPending} value={data && formatCompact(data.metrics.requests.value)} delta={data && `+${data.metrics.requests.delta}%`} deltaLabel="vs prior period">
              {data && <Sparkline values={data.metrics.requests.series} tone="accent" />}
            </MetricCard>
            <MetricCard label="Error rate" icon="AlertTriangle" invert loading={isPending} value={data && `${data.metrics.errorRate.value}%`} delta={data && `${data.metrics.errorRate.delta}%`} deltaLabel="vs prior period">
              {data && <Sparkline values={data.metrics.errorRate.series} tone="danger" />}
            </MetricCard>
            <MetricCard label="Median latency" icon="Zap" invert loading={isPending} value={data && `${data.metrics.latencyMs.value} ms`} delta={data && `${data.metrics.latencyMs.delta}%`} deltaLabel="vs prior period">
              {data && <Sparkline values={data.metrics.latencyMs.series} tone="warning" />}
            </MetricCard>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard className="lg:col-span-2" title="Traffic" description="Requests and errors, last 14 days" loading={isPending} empty={data?.traffic.length === 0}>
              {data && (
                <TimeSeriesChart
                  data={data.traffic}
                  xKey="date"
                  series={[{ key: 'requests', label: 'Requests', tone: 'primary' }, { key: 'errors', label: 'Errors', tone: 'danger' }]}
                  xFormatter={(v) => formatDate(v, { month: 'short', day: 'numeric' })}
                  summary="Requests and errors per day over the last 14 days"
                />
              )}
            </ChartCard>
            <ChartCard title="Users by role" description="Current workspace members" loading={isPending}>
              {data && <DonutChart data={data.roleDistribution} centerValue={String(data.roleDistribution.reduce((s, r) => s + r.value, 0))} centerLabel="users" summary="Distribution of users by role" />}
            </ChartCard>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>Recent activity</CardTitle>
                  <CardDescription>Latest administrative actions</CardDescription>
                </div>
                {can('audit.view') && (
                  <Link href="/audit" className="text-sm font-medium text-primary hover:underline">
                    View audit log
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                {isPending ? (
                  <div className="space-y-4" role="status" aria-label="Loading activity">
                    {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : data!.activity.length === 0 ? (
                  <p className="py-6 text-center text-sm text-text-muted">No activity yet.</p>
                ) : (
                  <ol className="divide-y divide-border">
                    {data!.activity.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0">
                        <p className="min-w-0 text-text">
                          <span className="font-medium">{a.actor}</span> <span className="text-text-muted">{a.action}</span> <span className="font-medium">{a.target}</span>
                        </p>
                        <time dateTime={a.at} className="shrink-0 text-xs text-text-muted">{formatRelative(a.at)}</time>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Service status</CardTitle>
                  <CardDescription>Live from health checks</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {isPending ? (
                  <div className="space-y-3" role="status" aria-label="Loading services">
                    {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {data!.services.map((s) => (
                      <li key={s.id} className="flex items-center justify-between text-sm">
                        <span className="text-text">{s.name}</span>
                        <Badge variant={statusMeta[s.status].variant} dot>{statusMeta[s.status].label}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </PageContainer>
  );
}
