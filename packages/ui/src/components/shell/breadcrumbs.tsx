'use client';

import Link from 'next/link';
import type { BreadcrumbCrumb } from '@nexus/config';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';

export type BreadcrumbItem = BreadcrumbCrumb;

/** Breadcrumb row. Sits directly below the top bar (non-negotiable UX rule 3). */
export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('border-b border-border bg-surface/60 px-4 py-2.5 text-sm text-text-muted md:px-6', className)}>
      <ol className="flex min-w-0 items-center gap-1.5">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className={cn('flex min-w-0 items-center gap-1.5', !last && 'max-sm:hidden', last && 'max-sm:flex')}>
              {index > 0 && <IconRenderer name="ChevronRight" className="size-3.5 shrink-0 text-text-muted/70 max-sm:hidden" />}
              {last ? (
                <span aria-current="page" className="truncate font-semibold text-text">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link href={item.href} className="truncate rounded hover:text-text hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className="truncate">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
