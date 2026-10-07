'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '../../lib/utils';

export const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(function Switch({ className, ...props }, ref) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        'peer relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent',
        'bg-border-strong transition-colors data-[state=checked]:bg-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        "after:absolute after:-inset-2 after:content-[''] [@media(pointer:fine)]:after:hidden",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-5 translate-x-0.5 rounded-full bg-surface shadow transition-transform data-[state=checked]:translate-x-[22px] motion-reduce:transition-none" />
    </SwitchPrimitive.Root>
  );
});
