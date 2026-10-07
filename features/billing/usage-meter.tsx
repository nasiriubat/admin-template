import { cn, formatNumber } from '@nexus/ui';

/** Labelled progress bar with `role="progressbar"` semantics; colour never carries meaning alone. */
export function UsageMeter({ label, used, limit, unit = '' }: { label: string; used: number; limit: number; unit?: string }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const tone = pct >= 100 ? 'bg-danger' : pct >= 85 ? 'bg-warning' : 'bg-primary';
  const text = `${formatNumber(used, { maximumFractionDigits: 1 })}${unit} of ${formatNumber(limit)}${unit}`;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-text">{label}</span>
        <span className="tabular-nums text-text-muted">{text} ({pct}%)</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(used, limit)}
        aria-valuetext={`${text}, ${pct} percent`}
        className="h-2 overflow-hidden rounded-full bg-canvas"
      >
        <div className={cn('h-full rounded-full transition-[width] duration-200 motion-reduce:transition-none', tone)} style={{ width: `${pct}%` }} />
      </div>
      {pct >= 85 && <p className="text-xs font-medium text-text-muted">{pct >= 100 ? 'Limit reached.' : 'Approaching your limit.'}</p>}
    </div>
  );
}
