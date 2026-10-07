import type { ReactNode } from 'react';
import { cn } from '@nexus/ui/marketing';
import { neon } from './neon';

export function NeonHeading({ id, eyebrow, children, description, align = 'center' }: { id: string; eyebrow: string; children: ReactNode; description?: string; align?: 'center' | 'left' }) {
  return (
    <div className={cn('mb-10 max-w-2xl space-y-3 md:mb-14', align === 'center' && 'mx-auto text-center')}>
      <p className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest', neon.panel)}>
        <span aria-hidden="true" className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_2px_rgb(var(--primary-rgb)/0.8)]" />
        {eyebrow}
      </p>
      <h2 id={id} className="text-3xl font-semibold tracking-tight md:text-5xl">
        {children}
      </h2>
      {description && <p className={cn('text-lg', neon.muted)}>{description}</p>}
    </div>
  );
}
