import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface DescriptionItem {
  label: ReactNode;
  value: ReactNode;
  /** Span the full width (long values such as descriptions or URLs). */
  wide?: boolean;
}

const cols = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3' } as const;

/** Semantic label/value grid (`<dl>`) for detail pages. Missing values render an en dash. */
export function DescriptionList({
  items,
  columns = 2,
  className,
  ...props
}: { items: DescriptionItem[]; columns?: 1 | 2 | 3 } & Omit<HTMLAttributes<HTMLDListElement>, 'children'>) {
  return (
    <dl className={cn('grid grid-cols-1 gap-x-8 gap-y-4', cols[columns], className)} {...props}>
      {items.map((item, i) => (
        <div key={i} className={cn('min-w-0', item.wide && 'sm:col-span-full')}>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">{item.label}</dt>
          <dd className="mt-1 break-words text-sm text-text">{item.value === null || item.value === undefined || item.value === '' ? '–' : item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
