import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'bg-canvas text-text-muted border-border',
        primary: 'bg-primary/10 text-primary border-primary/20',
        success: 'bg-success/10 text-success border-success/25',
        warning: 'bg-warning/10 text-warning border-warning/25',
        danger: 'bg-danger/10 text-danger border-danger/25',
        info: 'bg-info/10 text-info border-info/25',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Adds a leading status dot (decorative; the text carries the meaning). */
  dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
