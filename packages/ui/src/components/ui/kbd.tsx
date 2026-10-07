import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

/** Keyboard key hint such as `⌘K`. Purely presentational; pair with a real accessible shortcut. */
export const Kbd = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Kbd({ className, ...props }, ref) {
  return (
    <kbd
      ref={ref}
      className={cn(
        'inline-flex min-w-6 items-center justify-center rounded-md border border-border-strong border-b-2 bg-canvas px-1.5 py-0.5 font-mono text-xs font-medium text-text-muted',
        className,
      )}
      {...props}
    />
  );
});
