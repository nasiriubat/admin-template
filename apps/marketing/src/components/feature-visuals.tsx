import { cn } from '@nexus/ui';
import { ProductPreview } from './product-preview';

const frame = 'overflow-hidden rounded-card border border-border bg-canvas p-4 shadow-popover';

/** Responsive table turning into record cards. Pure markup, token colours only. */
export function TableVisual() {
  return (
    <div role="img" aria-label="Illustration of a data table on desktop and the same data as record cards on mobile" className={cn(frame, 'grid gap-4 sm:grid-cols-[1.4fr_1fr]')}>
      <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-4 items-center gap-2">
            <div className="h-3 rounded bg-text/70" />
            <div className="h-3 rounded bg-border" />
            <div className="h-3 rounded bg-border" />
            <div className={cn('h-4 rounded-full', i % 2 ? 'bg-success/30' : 'bg-warning/30')} />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2 rounded-lg border border-border bg-surface p-3">
            <div className="h-3 w-24 rounded bg-text/70" />
            <div className="h-2 w-16 rounded bg-border" />
            <div className="h-4 w-14 rounded-full bg-success/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Light and dark swatches side by side, driven by the real tokens. */
export function ThemeVisual() {
  const swatches = ['bg-primary', 'bg-accent', 'bg-success', 'bg-warning', 'bg-danger', 'bg-info'];
  return (
    <div role="img" aria-label="Illustration of the theme tokens as a row of colour swatches on a surface" className={frame}>
      <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <div className="flex gap-2">
          {swatches.map((s) => (
            <span key={s} className={cn('size-9 rounded-lg', s)} />
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-3 w-3/4 rounded bg-text/70" />
          <div className="h-3 w-1/2 rounded bg-border" />
        </div>
        <div className="h-9 w-28 rounded-input bg-primary" />
      </div>
    </div>
  );
}

export function ShellVisual() {
  return <ProductPreview highlight={1} />;
}
