'use client';

import { useState } from 'react';
import {
  Button,
  cn,
  EmptyState,
  formatRelative,
  IconRenderer,
  PageContainer,
  PageHeader,
  QueryBoundary,
  Skeleton,
  Switch,
} from '@nexus/ui';
import { useHealth, useNow } from './hooks';
import { IncidentList } from './incident-list';
import { overallHeadline, overallStatus } from './health-utils';
import { ServiceCard } from './service-card';
import { STATUS_META, type HealthSnapshot } from './types';

const bannerTone = {
  operational: 'border-success/30 bg-success/10',
  degraded: 'border-warning/30 bg-warning/10',
  outage: 'border-danger/30 bg-danger/10',
} as const;
const bannerIcon = { operational: 'text-success', degraded: 'text-warning', outage: 'text-danger' } as const;

function HealthSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full rounded-card" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-52 rounded-card" />
        ))}
      </div>
    </div>
  );
}

export function HealthPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const query = useHealth(autoRefresh);
  const now = useNow();

  return (
    <PageContainer>
      <PageHeader
        title="System Health"
        description="Live status of the services that power your workspace."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-h-9 items-center gap-2 text-sm text-text">
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} aria-label="Auto-refresh every 30 seconds" />
              Auto-refresh (30s)
            </label>
            <Button variant="secondary" loading={query.isFetching} onClick={() => void query.refetch()}>
              <IconRenderer name="RefreshCw" className={cn('size-4', query.isFetching && 'motion-safe:animate-spin')} /> Refresh
            </Button>
          </div>
        }
      />

      <QueryBoundary<HealthSnapshot>
        query={query}
        loading={<HealthSkeleton />}
        isEmpty={(d) => d.services.length === 0}
        empty={<EmptyState icon="Activity" title="No services monitored" description="Connect a health check endpoint to see service status here." />}
      >
        {(data) => {
          const status = overallStatus(data.services);
          return (
            <div className="space-y-6">
              <section aria-label="Overall status" className={cn('flex flex-wrap items-center gap-4 rounded-card border p-4 md:p-5', bannerTone[status])}>
                <IconRenderer name={STATUS_META[status].icon} className={cn('size-8 shrink-0', bannerIcon[status])} />
                <div className="min-w-0 flex-1" role="status">
                  <p className="text-lg font-semibold text-text">{overallHeadline(data.services)}</p>
                  <p className="text-sm text-text-muted">
                    Last checked {formatRelative(data.checkedAt, now)}
                    {autoRefresh ? '' : ' · auto-refresh is off'}
                  </p>
                </div>
              </section>

              <section aria-label="Services" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </section>

              <section aria-label="Incidents">
                <IncidentList incidents={data.incidents} services={data.services} now={now} />
              </section>
            </div>
          );
        }}
      </QueryBoundary>
    </PageContainer>
  );
}
