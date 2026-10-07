import { cn } from '../../../lib/utils';
import { Avatar } from '../../ui/avatar';

const STAR = 'M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.1L12 17.6 5.7 21.3l1.7-7.1L2 9.5l7.1-.6z';

export interface StarRatingProps {
  /** 0 to `max`; fractions render partial stars. */
  value: number;
  max?: number;
  /** Star size utility, default `size-4`. */
  sizeClass?: string;
  /** Optional count shown after the stars, e.g. 1,284 reviews. */
  reviewCount?: number;
  className?: string;
}

/** Read-only star rating with an accessible text value ("Rated 4.5 out of 5"). */
export function StarRating({ value, max = 5, sizeClass = 'size-4', reviewCount, className }: StarRatingProps) {
  const v = Math.max(0, Math.min(max, value));
  const label = `Rated ${v} out of ${max}${reviewCount ? ` from ${reviewCount.toLocaleString()} reviews` : ''}`;
  return (
    <span role="img" aria-label={label} className={cn('inline-flex items-center gap-1', className)}>
      <span aria-hidden="true" className="inline-flex gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const pct = Math.round(Math.max(0, Math.min(1, v - i)) * 100);
          return (
            <span key={i} className={cn('relative inline-block', sizeClass)}>
              <svg viewBox="0 0 24 24" focusable="false" className="absolute inset-0 size-full fill-border stroke-none"><path d={STAR} /></svg>
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
                <svg viewBox="0 0 24 24" focusable="false" className={cn('fill-warning stroke-none', sizeClass)}><path d={STAR} /></svg>
              </span>
            </span>
          );
        })}
      </span>
      {reviewCount !== undefined && <span aria-hidden="true" className="ml-1 text-sm text-text-muted">{reviewCount.toLocaleString()}</span>}
    </span>
  );
}

export interface AvatarStackItem {
  name: string;
  src?: string;
}

export interface AvatarStackProps {
  people: AvatarStackItem[];
  /** Avatars shown before the "+N" chip. */
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Overlapping avatar group with an overflow count. Names are available to assistive tech. */
export function AvatarStack({ people, max = 4, size = 'md', className }: AvatarStackProps) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  const chip = { sm: 'size-7 text-[11px]', md: 'size-9 text-xs', lg: 'size-12 text-sm' }[size];
  return (
    <div role="group" aria-label={`${people.length} people: ${people.map((p) => p.name).join(', ')}`} className={cn('flex items-center -space-x-2', className)}>
      {shown.map((p) => (
        <Avatar key={p.name} name={p.name} src={p.src} size={size} className="ring-2 ring-canvas" />
      ))}
      {extra > 0 && (
        <span aria-hidden="true" className={cn('inline-grid place-items-center rounded-full bg-surface-elevated font-semibold text-text-muted ring-2 ring-canvas', chip)}>
          +{extra}
        </span>
      )}
    </div>
  );
}
