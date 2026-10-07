'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import {
  Badge,
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
  TimeSeriesChart,
  UnauthorizedState,
  useTableQuery,
  type ChartSeries,
} from '@nexus/ui';
import { formatUsd } from './ai-utils';
import { useUsage } from './hooks';
import { USAGE_RANGES, type UsageConsumer, type UsageRange } from './types';

const TONES: NonNullable<ChartSeries['tone']>[] = ['primary', 'accent', 'info', 'success', 'warning', 'danger'];
const RANGE_LABEL: Record<UsageRange, string> = { '7d': 'last 7 days', '30d': 'last 30 days', '90d': 'last 90 days' };
const col = createColumnHelper<UsageConsumer>();

export function AiUsagePage() {
  const [range, setRange] = useState<UsageRange>('30d');
  const query = useUsage(range);
  const { data, isPending } = query;
  const status = (query.error as { status?: number } | null)?.status;
  const { query: tableQuery, setQuery } = useTableQuery({ sort: 'cost', direction: 'desc', pageSize: 5 });

  const columns = useMemo(
    () => [
      col.accessor('name', { header: 'Consumer', meta: { label: 'Consumer', mobile: 'primary', alwaysVisible: true }, cell: (c) => <span className="font-medium text-text">{c.getValue()}</span> }),
      col.accessor('kind', { header: 'Type', cell: (c) => <Badge variant={c.getValue() === 'user' ? 'info' : 'primary'} className="capitalize">{c.getValue()}</Badge> }),
      col.accessor('requests', { header: 'Requests', cell: (c) => c.getValue().toLocaleString() }),
      col.accessor('tokens', { header: 'Tokens', cell: (c) => formatCompact(c.getValue()), meta: { exportValue: (u: UsageConsumer) => u.tokens } }),
      col.accessor('cost', { header: 'Est. cost (USD)', cell: (c) => formatUsd(c.getValue()), meta: { exportValue: (u: UsageConsumer) => u.cost.toFixed(2) } }),
    ],
    [],
  );

  if (query.isError && status === 403) return <UnauthorizedState size="page" />;
  const m = data?.metrics;
  const retry = () => void query.refetch();
  const chartError = query.isError ? query.error : undefined;
  const series: ChartSeries[] = (data?.models ?? []).map((model, i) => ({ key: model, label: model, tone: TONES[i % TONES.length] }));
  const totalCost = data?.costByProvider.reduce((s, p) => s + p.value, 0) ?? 0;

  return (
    <PageContainer>
      <PageHeader
        title="AI usage"
        description="Requests, token volume and estimated spend across every provider."
        actions={<SegmentedControl label="Date range" value={range} onChange={setRange} options={USAGE_RANGES} className="w-full sm:w-64" />}
      />

      {query.isError && !data ? (
        <Card><ErrorState error={query.error} onRetry={retry} /></Card>
      ) : (
        <>
          <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Requests" icon="Activity" loading={isPending} value={m && formatCompact(m.requests)} />
            <MetricCard label="Tokens in" icon="ArrowDown" loading={isPending} value={m && formatCompact(m.tokensIn)} />
            <MetricCard label="Tokens out" icon="ArrowUp" loading={isPending} value={m && formatCompact(m.tokensOut)} />
            <MetricCard label="Estimated cost" icon="Gauge" loading={isPending} value={m && formatUsd(m.cost)} />
            <MetricCard label="Error rate" icon="AlertTriangle" loading={isPending} value={m && `${m.errorRate.toFixed(1)}%`} />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard className="lg:col-span-2" title="Tokens per day" description={`Stacked by model, ${RANGE_LABEL[range]}`} loading={isPending} error={chartError} onRetry={retry} empty={data?.daily.length === 0}>
              {data && (
                <TimeSeriesChart
                  variant="bar"
                  stacked
                  data={data.daily}
                  xKey="date"
                  series={series}
                  xFormatter={(v) => formatDate(v, { month: 'short', day: 'numeric' })}
                  valueFormatter={(v) => `${formatCompact(v)} tokens`}
                  summary={`Tokens per day stacked by model, ${RANGE_LABEL[range]}`}
                />
              )}
            </ChartCard>
            <ChartCard title="Cost by provider" description="Estimated spend" loading={isPending} error={chartError} onRetry={retry} empty={data?.costByProvider.length === 0}>
              {data && (
                <DonutChart
                  data={data.costByProvider}
                  centerValue={formatUsd(totalCost)}
                  centerLabel="estimated"
                  valueFormatter={formatUsd}
                  summary={`Estimated cost by provider, ${RANGE_LABEL[range]}`}
                />
              )}
            </ChartCard>
          </section>

          <section aria-labelledby="consumers-heading" className="space-y-3">
            <h2 id="consumers-heading" className="text-base font-semibold text-text">Top consumers</h2>
            <DataTable<UsageConsumer>
              caption="Top consumers"
              columns={columns}
              data={data?.consumers ?? []}
              getRowId={(u) => u.id}
              getRowLabel={(u) => u.name}
              mode="client"
              query={tableQuery}
              onQueryChange={setQuery}
              isLoading={isPending}
              error={chartError}
              onRetry={retry}
              searchPlaceholder="Search users and prompts"
              exportFileName={`ai-usage-top-consumers-${range}`}
              emptyTitle="No usage yet"
              emptyDescription="Usage appears here once requests start flowing through a provider."
            />
          </section>
        </>
      )}
    </PageContainer>
  );
}
