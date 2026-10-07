import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Current value between 0 and `max`. */
  value: number;
  max?: number;
  /** Accessible name. Required because a bar alone says nothing. */
  label: string;
  /** Show the label and percentage above the bar. */
  showValue?: boolean;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const tones = { primary: 'bg-primary', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', info: 'bg-info' } as const;

/** Determinate progress bar (`role="progressbar"`). For unknown durations use Spinner/Skeleton. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, label, showValue, tone = 'primary', className, ...props },
  ref,
) {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), safeMax);
  const percent = Math.round((clamped / safeMax) * 100);
  return (
    <div className={cn('space-y-1.5', className)} ref={ref} {...props}>
      {showValue && (
        <div className="flex items-center justify-between text-sm" aria-hidden="true">
          <span className="font-medium text-text">{label}</span>
          <span className="tabular-nums text-text-muted">{percent}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clamped}
        aria-valuetext={`${percent}%`}
        className="h-2 overflow-hidden rounded-full bg-border"
      >
        <div className={cn('h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none', tones[tone])} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
});
