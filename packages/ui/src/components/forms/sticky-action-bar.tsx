import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/** Save bar pinned to the bottom of long forms. Sits above the mobile bottom navigation. */
export function StickyActionBar({ dirty, children, className }: { dirty?: boolean; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur md:bottom-0 md:mx-0 md:rounded-card md:border',
        className,
      )}
    >
      <p className="text-sm text-text-muted" aria-live="polite">
        {dirty ? 'You have unsaved changes' : 'All changes saved'}
      </p>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
