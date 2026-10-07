import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';

/** Compact hero for inner pages (pricing, about, docs…). Use `Hero` for landing pages with a visual. */
export function PageHero({ eyebrow, title, description, children, align = 'center', className }: { eyebrow?: string; title: string; description?: string; children?: ReactNode; align?: 'center' | 'left'; className?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(60%_80%_at_50%_0%,rgb(var(--primary-rgb)/0.14),transparent)]" />
      <div className={cn('mx-auto max-w-6xl px-4 pb-12 pt-14 md:px-6 md:pb-16 md:pt-20', align === 'center' && 'text-center', className)}>
        {eyebrow && (
          <Badge variant="primary" className="mb-5">
            {eyebrow}
          </Badge>
        )}
        <h1 className={cn('max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl', align === 'center' && 'mx-auto')}>{title}</h1>
        {description && <p className={cn('mt-5 max-w-2xl text-lg text-text-muted', align === 'center' && 'mx-auto')}>{description}</p>}
        {children && <div className={cn('mt-8 flex flex-wrap gap-3', align === 'center' && 'justify-center')}>{children}</div>}
      </div>
    </section>
  );
}
