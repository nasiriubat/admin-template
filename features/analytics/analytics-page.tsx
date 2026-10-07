'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import {
  Card,
  ChartCard,
  DataTable,
  DonutChart,
  ErrorState,
  formatCompact,
  formatDate,
  MetricCard,
  PageContainer,
  PageHeader,
  SegmentedControl,
  Sparkline,
  TimeSeriesChart,
  UnauthorizedState,
  useTableQuery,
} from '@nexus/ui';
import { formatDelta, formatDuration, formatPercent } from './helpers';
import { useAnalyticsReport } from './hooks';
import { ANALYTICS_RANGES, type AnalyticsRange, type TopPage } from './types';

const RANGE_OPTIONS = ANALYTICS_RANGES.map((value) => ({ value, label: value === '7d' ? '7 days' : value === '30d' ? '30 days' : '90 days' }));
const RANGE_LABEL: Record<AnalyticsRange, string> = { '7d': 'last 7 days', '30d': 'last 30 days', '90d': 'last 90 days' };
const col = createColumnHelper<TopPage>();

export function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const query = useAnalyticsReport(range);
  const { data, isPending } = query;
  const status = (query.error as { status?: number } | null)?.status;
  const { query: tableQuery, setQuery } = useTableQuery({ sort: 'views', direction: 'desc', pageSize: 5 });

  const columns = useMemo(
    () => [
      col.accessor('path', { header: 'Page', meta: { label: 'Page', mobile: 'primary', alwaysVisible: true }, cell: (c) => <span className="font-medium text-text">{c.getValue()}</span> }),
      col.accessor('views', { header: 'Views', cell: (c) => c.getValue().toLocaleString() }),
      col.accessor('visitors', { header: 'Visitors', cell: (c) => c.getValue().toLocaleString() }),
      col.accessor('bounceRate', { header: 'Bounce rate', cell: (c) => formatPercent(c.getValue()), meta: { exportValue: (p: TopPage) => p.bounceRate } }),
      col.accessor('avgSeconds', { header: 'Avg. time', cell: (c) => formatDuration(c.getValue()), meta: { exportValue: (p: TopPage) => p.avgSeconds } }),
    ],
    [],
  );

  if (query.isError && status === 403) return <UnauthorizedState size="page" />;
  const m = data?.metrics;
  const xFormat = (v: string) => formatDate(v, { month: 'short', day: 'numeric' });
  const loading = isPending;
  const chartError = query.isError ? query.error : undefined;
  const retry = () => void query.refetch();

  return (
    <PageContainer>
      <PageHeader
        title="Analytics"
        description="Traffic, engagement and conversion across your product."
        actions={<SegmentedControl label="Date range" value={range} onChange={setRange} options={RANGE_OPTIONS} className="w-full sm:w-64" />}
      />

      {query.isError && !data ? (
        <Card>
          <ErrorState error={query.error} onRetry={retry} />
        </Card>
      ) : (
        <>
          <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Visitors" icon="Users" loading={loading} value={m && formatCompact(m.visitors.value)} delta={m && formatDelta(m.visitors.delta)} deltaLabel="vs previous period">
              {m && <Sparkline values={m.visitors.series} />}
            </MetricCard>
            <MetricCard label="Signups" icon="UserPlus" loading={loading} value={m && formatCompact(m.signups.value)} delta={m && formatDelta(m.signups.delta)} deltaLabel="vs previous period">
              {m && <Sparkline values={m.signups.series} tone="accent" />}
            </MetricCard>
            <MetricCard label="Conversion rate" icon="Target" loading={loading} value={m && formatPercent(m.conversionRate.value)} delta={m && formatDelta(m.conversionRate.delta)} deltaLabel="vs previous period">
              {m && <Sparkline values={m.conversionRate.series} tone="success" />}
            </MetricCard>
            <MetricCard label="Avg. session" icon="Clock" loading={loading} value={m && formatDuration(m.avgSessionSeconds.value)} delta={m && formatDelta(m.avgSessionSeconds.delta)} deltaLabel="vs previous period">
              {m && <Sparkline values={m.avgSessionSeconds.series} tone="info" />}
            </MetricCard>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard className="lg:col-span-2" title="Visitors and signups" description={`Daily, ${RANGE_LABEL[range]}`} loading={loading} error={chartError} onRetry={retry} empty={data?.timeline.length === 0}>
              {data && (
                <TimeSeriesChart
                  data={data.timeline}
                  xKey="date"
                  series={[{ key: 'visitors', label: 'Visitors', tone: 'primary' }, { key: 'signups', label: 'Signups', tone: 'accent' }]}
                  xFormatter={xFormat}
                  summary={`Visitors and signups per day, ${RANGE_LABEL[range]}`}
                />
              )}
            </ChartCard>
            <ChartCard title="Traffic sources" description="Where visitors come from" loading={loading} error={chartError} onRetry={retry} empty={data?.sources.length === 0}>
              {data && <DonutChart data={data.sources} centerValue={formatCompact(data.sources.reduce((s, r) => s + r.value, 0))} centerLabel="visitors" summary={`Visitors by traffic source, ${RANGE_LABEL[range]}`} />}
            </ChartCard>
          </section>

          <ChartCard title="Sessions by weekday" description="When people use the product" loading={loading} error={chartError} onRetry={retry} empty={data?.sessionsByWeekday.length === 0}>
            {data && <TimeSeriesChart variant="bar" data={data.sessionsByWeekday} xKey="day" series={[{ key: 'sessions', label: 'Sessions', tone: 'info' }]} height={240} summary={`Sessions per weekday, ${RANGE_LABEL[range]}`} />}
          </ChartCard>

          <section aria-labelledby="top-pages-heading" className="space-y-3">
            <h2 id="top-pages-heading" className="text-base font-semibold text-text">Top pages</h2>
            <DataTable<TopPage>
              caption="Top pages"
              columns={columns}
              data={data?.topPages ?? []}
              getRowId={(p) => p.path}
              getRowLabel={(p) => p.path}
              mode="client"
              query={tableQuery}
              onQueryChange={setQuery}
              isLoading={loading}
              error={chartError}
              onRetry={retry}
              searchPlaceholder="Search pages"
              exportFileName={`top-pages-${range}`}
              emptyTitle="No page views yet"
              emptyDescription="Page views will appear here once your site receives traffic."
            />
          </section>
        </>
      )}
    </PageContainer>
  );
}
