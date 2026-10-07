import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/** Title block for every page. Actions wrap under the title on mobile. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-text md:text-2xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-6', className)}>{children}</div>;
}

/** A labelled group of content inside a page, without drawing another card. */
export function Section({ title, description, actions, children, className }: { title: string; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('space-y-3', className)} aria-label={title}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text">{title}</h2>
          {description && <p className="text-sm text-text-muted">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
