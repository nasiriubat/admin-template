'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export const TooltipProvider = TooltipPrimitive.Provider;

export const TooltipContent = forwardRef<ElementRef<typeof TooltipPrimitive.Content>, ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>>(
  function TooltipContent({ className, sideOffset = 8, ...props }, ref) {
    return (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          className={cn(
            'z-[70] rounded-md border border-border bg-surface-elevated px-2.5 py-1.5 text-xs font-medium text-text shadow-popover',
            className,
          )}
          {...props}
        />
      </TooltipPrimitive.Portal>
    );
  },
);

/** Shows on hover AND keyboard focus (WCAG 1.4.13). Never put essential info only in a tooltip. */
export function Tooltip({ content, children, side = 'right' }: { content: ReactNode; children: ReactNode; side?: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <TooltipPrimitive.Root delayDuration={200}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </TooltipPrimitive.Root>
  );
}
