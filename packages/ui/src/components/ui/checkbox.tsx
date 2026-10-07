'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';

export const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
  return (
    // The 44px hit area comes from the wrapping padding on coarse pointers.
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'peer grid size-5 shrink-0 place-items-center rounded border border-border-strong bg-surface',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
        'disabled:cursor-not-allowed disabled:opacity-50',
        "relative after:absolute after:-inset-3 after:content-[''] [@media(pointer:fine)]:after:hidden",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <IconRenderer name={props.checked === 'indeterminate' ? 'Minus' : 'Check'} className="size-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
