import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export interface DeviceFrameProps {
  /** `browser` window chrome or `phone` handset. */
  variant?: 'browser' | 'phone';
  /** Address shown in the browser bar (decorative text). */
  url?: string;
  /** Screen content (real, accessible markup: screenshots, live UI). */
  children?: ReactNode;
  className?: string;
  /** Extra classes for the screen area (e.g. `aspect-[16/10]`). */
  screenClassName?: string;
}

/** Token-driven browser-window or phone mockup with a content slot. All chrome is aria-hidden. */
export function DeviceFrame({ variant = 'browser', url = 'app.example.com', children, className, screenClassName }: DeviceFrameProps) {
  if (variant === 'phone') {
    return (
      <div className={cn('relative mx-auto w-full max-w-[18rem] rounded-[2.5rem] border border-border bg-surface-elevated p-2.5 shadow-popover', className)}>
        <div aria-hidden="true" className="absolute left-1/2 top-4 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-text/80" />
        <div className={cn('aspect-[9/19] overflow-hidden rounded-[2rem] bg-canvas', screenClassName)}>{children}</div>
        <div aria-hidden="true" className="mx-auto mt-2 h-1 w-24 rounded-full bg-border-strong" />
      </div>
    );
  }
  return (
    <div className={cn('overflow-hidden rounded-card border border-border bg-surface-elevated shadow-popover', className)}>
      <div aria-hidden="true" className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-danger" />
          <span className="size-2.5 rounded-full bg-warning" />
          <span className="size-2.5 rounded-full bg-success" />
        </span>
        <span className="mx-auto w-full max-w-xs truncate rounded-md bg-canvas px-3 py-1 text-center text-xs text-text-muted">{url}</span>
        <span className="w-10 shrink-0 max-sm:hidden" />
      </div>
      <div className={cn('bg-canvas', screenClassName)}>{children}</div>
    </div>
  );
}

/** Shorthand for `<DeviceFrame variant="browser" />`. */
export const BrowserFrame = (p: Omit<DeviceFrameProps, 'variant'>) => <DeviceFrame {...p} variant="browser" />;
/** Shorthand for `<DeviceFrame variant="phone" />`. */
export const PhoneFrame = (p: Omit<DeviceFrameProps, 'variant'>) => <DeviceFrame {...p} variant="phone" />;
