import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

/** Placeholder block. Decorative: pair with an aria-busy region or a visible loading label. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative overflow-hidden rounded-md bg-border/70',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer',
        'after:bg-gradient-to-r after:from-transparent after:via-surface/60 after:to-transparent',
        'motion-reduce:after:hidden',
        className,
      )}
      {...props}
    />
  );
}
