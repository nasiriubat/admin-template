import { cn } from '@nexus/ui';

/** Lightweight, token-driven illustration of the admin UI (pure markup: no images to license or load). */
export function ProductPreview({ compact, highlight = -1 }: { compact?: boolean; highlight?: number }) {
  return (
    <div role="img" aria-label="Illustration of the admin dashboard with sidebar, metric cards and a chart" className="overflow-hidden rounded-card border border-border bg-canvas text-left shadow-popover">
      <div className="flex">
        <div className="hidden w-36 shrink-0 space-y-2 border-r border-border bg-surface p-3 sm:block">
          <div className="h-6 w-20 rounded-md bg-primary" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={cn('h-5 rounded-md', i === (highlight >= 0 ? highlight : 0) ? 'bg-primary/20' : 'bg-border')} />
          ))}
        </div>
        <div className="flex-1 space-y-3 p-4">
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn('rounded-lg border border-border bg-surface p-3', highlight === i && 'ring-2 ring-primary')}>
                <div className="h-2 w-10 rounded bg-border" />
                <div className="mt-2 h-4 w-14 rounded bg-text/80" />
              </div>
            ))}
          </div>
          {!compact && (
            <div className="rounded-lg border border-border bg-surface p-3">
              <svg viewBox="0 0 400 120" className="h-28 w-full" aria-hidden="true" preserveAspectRatio="none">
                <path d="M0 90 C40 70 60 100 100 60 S170 40 210 55 S290 20 330 35 S380 25 400 15 V120 H0Z" fill="rgb(var(--primary-rgb) / 0.15)" />
                <path d="M0 90 C40 70 60 100 100 60 S170 40 210 55 S290 20 330 35 S380 25 400 15" fill="none" stroke="rgb(var(--primary-rgb))" strokeWidth="2.5" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
