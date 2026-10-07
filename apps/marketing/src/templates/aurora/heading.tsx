import type { ReactNode } from 'react';
import { cn } from '@nexus/ui/marketing';

/** Centered eyebrow + h2 + intro used by every Aurora section. The heading id names the section. */
export function AuroraHeading({ id, eyebrow, children, description, className }: { id: string; eyebrow: string; children: ReactNode; description?: string; className?: string }) {
  return (
    <div className={cn('mx-auto mb-10 max-w-2xl space-y-3 text-center md:mb-14', className)}>
      <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm font-semibold text-primary">{eyebrow}</p>
      <h2 id={id} className="text-3xl font-semibold tracking-tight md:text-5xl">
        {children}
      </h2>
      {description && <p className="text-lg text-text-muted">{description}</p>}
    </div>
  );
}
