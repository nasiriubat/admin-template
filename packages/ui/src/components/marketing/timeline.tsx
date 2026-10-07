import { Badge, type BadgeProps } from '../ui/badge';

export interface TimelineItem {
  date: string;
  title: string;
  description: string;
}

/** Vertical timeline. Dates are plain text so the component stays locale/timezone neutral. */
export function Timeline({ items, label }: { items: TimelineItem[]; label: string }) {
  return (
    <ol aria-label={label} className="relative ml-3 space-y-10 border-l border-border">
      {items.map((item) => (
        <li key={item.title} className="relative pl-8">
          <span aria-hidden="true" className="absolute -left-[7px] top-1.5 size-3.5 rounded-full border-2 border-primary bg-canvas" />
          <p className="text-sm font-medium text-primary">{item.date}</p>
          <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
          <p className="mt-2 text-text-muted">{item.description}</p>
        </li>
      ))}
    </ol>
  );
}

export type ChangeType = 'Added' | 'Changed' | 'Fixed';
export interface Release {
  version: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  summary: string;
  changes: Array<{ type: ChangeType; text: string }>;
}

const tone: Record<ChangeType, NonNullable<BadgeProps['variant']>> = { Added: 'success', Changed: 'info', Fixed: 'warning' };

export function formatReleaseDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export function ReleaseTimeline({ releases }: { releases: Release[] }) {
  return (
    <ol aria-label="Releases" className="relative ml-3 space-y-14 border-l border-border">
      {releases.map((r) => (
        <li key={r.version} id={`v${r.version}`} className="relative scroll-mt-24 pl-8">
          <span aria-hidden="true" className="absolute -left-[7px] top-2 size-3.5 rounded-full border-2 border-primary bg-canvas" />
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">v{r.version}</h2>
            <time dateTime={r.date} className="text-sm text-text-muted">
              {formatReleaseDate(r.date)}
            </time>
          </div>
          <p className="mt-2 text-text-muted">{r.summary}</p>
          <ul className="mt-5 space-y-3 rounded-card border border-border bg-surface p-5">
            {r.changes.map((c) => (
              <li key={c.text} className="flex flex-col items-start gap-2 text-sm sm:flex-row sm:gap-3">
                <Badge variant={tone[c.type]} className="sm:mt-0.5 sm:w-20 sm:justify-center">
                  {c.type}
                </Badge>
                <span>{c.text}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
