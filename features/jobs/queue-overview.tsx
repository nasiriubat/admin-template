import { Card, CardContent, CardDescription, CardHeader, CardTitle, ErrorState, formatNumber, MetricCard, Skeleton } from '@nexus/ui';
import { queueShares } from './jobs-utils';
import type { JobStats } from './types';

interface Props {
  stats?: JobStats;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
}

export function QueueOverview({ stats, isPending, error, onRetry }: Props) {
  if (error && !stats) {
    return (
      <Card>
        <ErrorState error={error} onRetry={onRetry} />
      </Card>
    );
  }
  const fmt = (n?: number) => (n === undefined ? undefined : formatNumber(n));
  return (
    <div className="space-y-4">
      <section aria-label="Queue totals" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Queued" icon="Layers" loading={isPending} value={fmt(stats?.queued)} />
        <MetricCard label="Running" icon="Cpu" loading={isPending} value={fmt(stats?.running)} />
        <MetricCard label="Failed" icon="AlertTriangle" loading={isPending} value={fmt(stats?.failed)} />
        <MetricCard label="Completed (24h)" icon="CheckCircle2" loading={isPending} value={fmt(stats?.completed24h)} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Queue breakdown</CardTitle>
          <CardDescription>Jobs on record per queue.</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending || !stats ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <ul className="divide-y divide-border">
              {stats.queues.map((q) => {
                const s = queueShares(q);
                return (
                  <li key={q.name} className="grid gap-2 py-3 first:pt-0 last:pb-0 md:grid-cols-[10rem_1fr_auto] md:items-center md:gap-4">
                    <span className="font-mono text-sm font-medium text-text">{q.name}</span>
                    <div aria-hidden="true" className="flex h-2 overflow-hidden rounded-full bg-canvas">
                      <span className="bg-success" style={{ width: `${s.succeeded}%` }} />
                      <span className="bg-primary" style={{ width: `${s.running}%` }} />
                      <span className="bg-info" style={{ width: `${s.queued}%` }} />
                      <span className="bg-danger" style={{ width: `${s.failed}%` }} />
                    </div>
                    <p className="text-xs tabular-nums text-text-muted">
                      {q.queued} queued · {q.running} running · {q.failed} failed · {q.succeeded} succeeded
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
