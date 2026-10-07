'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';

const bannerVariants = cva('flex items-start gap-3 rounded-card border px-4 py-3 text-sm text-text', {
  variants: {
    variant: {
      info: 'border-info/30 bg-info/10 [&_.banner-icon]:text-info',
      success: 'border-success/30 bg-success/10 [&_.banner-icon]:text-success',
      warning: 'border-warning/30 bg-warning/10 [&_.banner-icon]:text-warning',
      danger: 'border-danger/30 bg-danger/10 [&_.banner-icon]:text-danger',
    },
  },
  defaultVariants: { variant: 'info' },
});

const icons = { info: 'Info', success: 'CheckCircle2', warning: 'AlertTriangle', danger: 'AlertCircle' } as const;

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>, VariantProps<typeof bannerVariants> {
  title?: ReactNode;
  /** Trailing actions such as a link or button. */
  actions?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

/** Page-level dismissible banner. Dismissal is per mount; persist it in the caller if it must stick. */
export function Banner({ variant = 'info', title, actions, dismissible = true, onDismiss, className, children, ...props }: BannerProps) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  const tone = variant ?? 'info';
  return (
    <div role="region" aria-label={typeof title === 'string' ? title : 'Notice'} className={cn(bannerVariants({ variant }), className)} {...props}>
      <IconRenderer name={icons[tone]} className="banner-icon mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1 space-y-0.5">
        {title && <p className="font-semibold leading-snug">{title}</p>}
        {children && <div className={title ? 'text-text-muted' : undefined}>{children}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            setOpen(false);
            onDismiss?.();
          }}
          className="-my-1 -mr-2 grid size-8 shrink-0 place-items-center rounded-md text-text-muted hover:bg-canvas hover:text-text [@media(pointer:coarse)]:size-11"
        >
          <IconRenderer name="X" className="size-4" />
        </button>
      )}
    </div>
  );
}
