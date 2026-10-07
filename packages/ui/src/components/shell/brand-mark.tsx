import { cn } from '../../lib/utils';

/** Square logo mark. Replace the initial or pass `children` (an <img>/<svg>) to rebrand. */
export function BrandMark({ className, children, initial = 'N' }: { className?: string; children?: React.ReactNode; initial?: string }) {
  return (
    <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-sm', className)} aria-hidden="true">
      {children ?? initial}
    </span>
  );
}
