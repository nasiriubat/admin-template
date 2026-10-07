import { cn } from '@nexus/ui/marketing';
import type { DashModule, Tone } from '../../content/product';

/* Literal classes so Tailwind can see them. */
export const toneText: Record<Tone, string> = { success: 'text-success', warning: 'text-warning', danger: 'text-danger', info: 'text-info', primary: 'text-primary' };
export const toneSoft: Record<Tone, string> = { success: 'bg-success/15 text-success', warning: 'bg-warning/15 text-warning', danger: 'bg-danger/15 text-danger', info: 'bg-info/15 text-info', primary: 'bg-primary/15 text-primary' };

function Sparkline({ series }: { series: number[] }) {
  const step = 400 / (series.length - 1);
  const pts = series.map((v, i) => `${(i * step).toFixed(1)},${(110 - v).toFixed(1)}`);
  return (
    <svg viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true" focusable="false" className="h-full w-full">
      <polygon points={`0,120 ${pts.join(' ')} 400,120`} className="fill-primary/15" />
      <polyline points={pts.join(' ')} fill="none" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="stroke-primary" />
    </svg>
  );
}

/**
 * Token-driven illustration of the admin dashboard (sidebar, KPI cards, trend chart, recent rows).
 * Exposed to assistive tech as one image; its text is sample data, not interactive content.
 */
export function DashboardMock({ data, label, className }: { data: DashModule; label?: string; className?: string }) {
  return (
    <div role="img" aria-label={label ?? `Illustration of the ${data.title} dashboard with sidebar, key figures, a trend chart and recent activity`} className={cn('flex bg-canvas text-left', className)}>
      <div className="hidden w-[22%] shrink-0 flex-col gap-1.5 border-r border-border bg-surface p-3 sm:flex">
        <span className="mb-2 flex items-center gap-2 text-xs font-semibold">
          <span className="grid size-5 place-items-center rounded-md bg-primary text-[10px] text-primary-foreground">N</span>
          Nexus
        </span>
        {data.nav.map((n, i) => (
          <span key={n} className={cn('rounded-md px-2 py-1.5 text-[11px]', i === 0 ? 'bg-primary/15 font-semibold text-primary' : 'text-text-muted')}>
            {n}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1 space-y-3 p-3 sm:p-4">
        <p className="text-xs font-semibold sm:text-sm">{data.title}</p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {data.kpis.map((k) => (
            <div key={k.label} className="rounded-lg border border-border bg-surface p-2 sm:p-3">
              <p className="truncate text-[10px] text-text-muted sm:text-[11px]">{k.label}</p>
              <p className="mt-0.5 text-sm font-semibold sm:text-base">{k.value}</p>
              <p className={cn('text-[10px] font-medium', toneText[k.tone])}>{k.delta}</p>
            </div>
          ))}
        </div>
        <div className="h-20 rounded-lg border border-border bg-surface p-2 sm:h-28">
          <Sparkline series={data.series} />
        </div>
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface text-[11px]">
          {data.rows.map((r) => (
            <li key={r.name} className="flex items-center justify-between gap-2 px-3 py-2">
              <span className="min-w-0">
                <span className="block truncate font-medium">{r.name}</span>
                <span className="block truncate text-text-muted">{r.meta}</span>
              </span>
              <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', toneSoft[r.tone])}>{r.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
