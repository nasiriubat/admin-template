import { Badge, cn, IconRenderer } from '@nexus/ui';
import { describeDay, formatUptime, summarizeHistory } from './health-utils';
import { STATUS_META, type DayUptime, type HealthService, type ServiceStatus } from './types';

const segmentTone: Record<ServiceStatus, string> = { operational: 'bg-success', degraded: 'bg-warning', outage: 'bg-danger' };

/** 30 day strip. A list so each day has a text alternative; the label summarises the whole strip. */
export function UptimeStrip({ name, history }: { name: string; history: ReadonlyArray<DayUptime> }) {
  return (
    <div>
      <ul aria-label={summarizeHistory(name, history)} className="flex h-8 items-stretch gap-[2px]">
        {history.map((day) => (
          <li key={day.date} title={describeDay(day)} className={cn('min-w-0 flex-1 rounded-[2px]', segmentTone[day.status])}>
            <span className="sr-only">{describeDay(day)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-1.5 flex justify-between text-xs text-text-muted" aria-hidden="true">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

export function ServiceCard({ service }: { service: HealthService }) {
  const meta = STATUS_META[service.status];
  return (
    <article aria-label={service.name} className="min-w-0 rounded-card border border-border bg-surface p-[var(--card-padding)] shadow-card">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <IconRenderer name={service.icon} className="size-4" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-text">{service.name}</h3>
            <p className="truncate text-xs text-text-muted">{service.description}</p>
          </div>
        </div>
        <Badge variant={meta.variant} dot>
          {meta.label}
        </Badge>
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs text-text-muted">Latency</dt>
          <dd className="text-lg font-semibold tabular-nums text-text">{service.latencyMs} ms</dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Uptime (30 days)</dt>
          <dd className="text-lg font-semibold tabular-nums text-text">{formatUptime(service.uptimePct)}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <UptimeStrip name={service.name} history={service.history} />
      </div>
    </article>
  );
}
