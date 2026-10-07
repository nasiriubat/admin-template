import { formatNumber, Progress } from '@nexus/ui';

/** Labelled progress bar with `role="progressbar"` semantics; colour never carries meaning alone. */
export function UsageMeter({ label, used, limit, unit = '' }: { label: string; used: number; limit: number; unit?: string }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const text = `${formatNumber(used, { maximumFractionDigits: 1 })}${unit} of ${formatNumber(limit)}${unit}`;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-text">{label}</span>
        <span className="tabular-nums text-text-muted">{text} ({pct}%)</span>
      </div>
      <Progress value={Math.min(used, limit)} max={limit || 1} label={label} aria-hidden={undefined} tone={pct >= 100 ? 'danger' : pct >= 85 ? 'warning' : 'primary'} />
    </div>
  );
}
