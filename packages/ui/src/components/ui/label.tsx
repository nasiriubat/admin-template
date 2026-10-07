'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '../../lib/utils';

export const Label = forwardRef<
  ElementRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean; optional?: boolean }
>(function Label({ className, required, optional, children, ...props }, ref) {
  return (
    <LabelPrimitive.Root ref={ref} className={cn('text-sm font-medium leading-none text-text', className)} {...props}>
      {children}
      {required && (
        <span className="ml-0.5 text-danger" aria-hidden="true">
          *
        </span>
      )}
      {optional && <span className="ml-1.5 text-xs font-normal text-text-muted">(optional)</span>}
    </LabelPrimitive.Root>
  );
});
