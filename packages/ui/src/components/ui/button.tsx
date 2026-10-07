import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './spinner';

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none',
    'rounded-button transition-colors duration-150',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    '[@media(pointer:coarse)]:min-h-11',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        secondary:
          'bg-surface text-text border border-border-strong hover:bg-canvas active:bg-canvas/70',
        ghost: 'text-text-muted hover:text-text hover:bg-canvas',
        danger: 'bg-danger text-danger-foreground hover:bg-danger/90 active:bg-danger/80',
        'danger-ghost': 'text-danger hover:bg-danger/10',
        link: 'text-primary underline-offset-4 hover:underline h-auto px-0',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-input min-h-9 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-input min-h-9 aspect-square min-w-9 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (e.g. a Next.js Link) while keeping button styles. */
  asChild?: boolean;
  /** Shows a spinner, disables interaction and sets aria-busy. */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild, loading, disabled, children, type, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Spinner className="size-4" />}
          {children}
        </>
      )}
    </Comp>
  );
});

/** Icon-only button. `label` is mandatory so every icon button has an accessible name. */
export const IconButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'size'> & { label: string }>(
  function IconButton({ label, variant = 'ghost', className, children, ...props }, ref) {
    return (
      <Button ref={ref} variant={variant} size="icon" aria-label={label} title={label} className={className} {...props}>
        {children}
      </Button>
    );
  },
);
