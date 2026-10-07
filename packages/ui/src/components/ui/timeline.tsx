import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';

export interface ActivityTimelineItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** ISO string or Date; rendered in a `<time>` element. */
  time: string | Date;
  /** Optional pre-formatted text for the time (e.g. "2 hours ago"). */
  timeLabel?: string;
  /** Registered icon name. */
  icon?: string;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const tones = {
  neutral: 'bg-canvas text-text-muted border-border-strong',
  primary: 'bg-primary/10 text-primary border-primary/30',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
  info: 'bg-info/10 text-info border-info/30',
} as const;

/** Admin activity timeline (the marketing `Timeline` is a different component). Ordered list of events with a connecting rail. Pass items newest-first for an activity feed. */
export function ActivityTimeline({ items, label = 'Activity', className }: { items: ActivityTimelineItem[]; label?: string; className?: string }) {
  return (
    <ol aria-label={label} className={cn('space-y-0', className)}>
      {items.map((item, i) => {
        const date = typeof item.time === 'string' ? new Date(item.time) : item.time;
        const valid = !Number.isNaN(date.getTime());
        return (
          <li key={item.id} className="relative flex gap-3 pb-6 last:pb-0">
            {i < items.length - 1 && <span aria-hidden="true" className="absolute left-4 top-8 -ml-px h-[calc(100%-2rem)] w-px bg-border" />}
            <span className={cn('relative grid size-8 shrink-0 place-items-center rounded-full border', tones[item.tone ?? 'neutral'])}>
              <IconRenderer name={item.icon ?? 'Clock'} className="size-4" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-sm font-medium text-text">{item.title}</p>
                {valid && (
                  <time dateTime={date.toISOString()} className="text-xs text-text-muted">
                    {item.timeLabel ?? date.toLocaleString()}
                  </time>
                )}
              </div>
              {item.description && <p className="mt-0.5 text-sm text-text-muted">{item.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Same component under the name used for feeds on dashboards and detail pages. */
export const ActivityFeed = ActivityTimeline;
