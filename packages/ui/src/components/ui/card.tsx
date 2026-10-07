import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

/** The one surface primitive: sits on the canvas, never inside another Card. */
export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { elevated?: boolean }>(
  function Card({ className, elevated, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-card border border-border text-text',
          elevated ? 'bg-surface-elevated shadow-popover' : 'bg-surface',
          className,
        )}
        {...props}
      />
    );
  },
);

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1 p-[var(--card-padding)] pb-0 sm:flex-row sm:items-start sm:justify-between', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-base font-semibold tracking-tight text-text', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-text-muted', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-[var(--card-padding)]', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 border-t border-border p-4 px-[var(--card-padding)]', className)}
      {...props}
    />
  );
}
