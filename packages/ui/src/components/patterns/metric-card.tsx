import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';
import { Skeleton } from '../ui/skeleton';

export interface MetricCardProps {
  label: string;
  value: ReactNode;
  /** e.g. "+12.4%". Sign decides colour unless `trend` overrides. */
  delta?: string;
  deltaLabel?: string;
  trend?: 'up' | 'down' | 'flat';
  /** When `up` is bad (e.g. error rate), invert the colour meaning. */
  invert?: boolean;
  icon?: string;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
}

export function MetricCard({ label, value, delta, deltaLabel, trend, invert, icon, loading, children, className }: MetricCardProps) {
  const direction = trend ?? (delta?.startsWith('-') ? 'down' : delta ? 'up' : 'flat');
  const good = direction === 'flat' ? null : (direction === 'up') !== Boolean(invert);
  return (
    <div className={cn('rounded-card border border-border bg-surface p-[var(--card-padding)] shadow-card', className)} aria-busy={loading || undefined}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-text-muted">{label}</p>
        {icon && (
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <IconRenderer name={icon} className="size-4" />
          </span>
        )}
      </div>
      {loading ? (
        <div className="mt-3 space-y-2" role="status" aria-label={`Loading ${label}`}>
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      ) : (
        <>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-text tabular-nums md:text-3xl">{value}</p>
          {(delta || deltaLabel) && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs">
              {delta && (
                <span className={cn('inline-flex items-center gap-0.5 font-semibold', good === null ? 'text-text-muted' : good ? 'text-success' : 'text-danger')}>
                  {direction !== 'flat' && <IconRenderer name={direction === 'up' ? 'TrendingUp' : 'TrendingDown'} className="size-3.5" />}
                  {delta}
                </span>
              )}
              {deltaLabel && <span className="text-text-muted">{deltaLabel}</span>}
            </p>
          )}
          {children}
        </>
      )}
    </div>
  );
}
