'use client';

import * as MenuPrimitive from '@radix-ui/react-dropdown-menu';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '../../lib/utils';

export const DropdownMenu = MenuPrimitive.Root;
export const DropdownMenuTrigger = MenuPrimitive.Trigger;
export const DropdownMenuGroup = MenuPrimitive.Group;

export const DropdownMenuContent = forwardRef<
  ElementRef<typeof MenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof MenuPrimitive.Content>
>(function DropdownMenuContent({ className, sideOffset = 8, align = 'end', ...props }, ref) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        collisionPadding={8}
        className={cn(
          'z-[60] min-w-48 max-w-[calc(100vw-1rem)] overflow-hidden rounded-card border border-border bg-surface-elevated p-1 text-text shadow-popover animate-pop-in',
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
});

export const DropdownMenuItem = forwardRef<
  ElementRef<typeof MenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof MenuPrimitive.Item> & { destructive?: boolean }
>(function DropdownMenuItem({ className, destructive, ...props }, ref) {
  return (
    <MenuPrimitive.Item
      ref={ref}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2.5 rounded-md px-3 py-2 text-sm outline-none',
        'data-[highlighted]:bg-canvas data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        '[@media(pointer:coarse)]:min-h-11',
        destructive ? 'text-danger data-[highlighted]:bg-danger/10' : 'text-text',
        className,
      )}
      {...props}
    />
  );
});

export const DropdownMenuCheckboxItem = forwardRef<
  ElementRef<typeof MenuPrimitive.CheckboxItem>,
  ComponentPropsWithoutRef<typeof MenuPrimitive.CheckboxItem>
>(function DropdownMenuCheckboxItem({ className, children, ...props }, ref) {
  return (
    <MenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm outline-none data-[highlighted]:bg-canvas',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2.5 grid size-4 place-items-center">
        <MenuPrimitive.ItemIndicator>
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="m3 8.5 3.2 3L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </MenuPrimitive.ItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
});

export const DropdownMenuLabel = forwardRef<ElementRef<typeof MenuPrimitive.Label>, ComponentPropsWithoutRef<typeof MenuPrimitive.Label>>(
  function DropdownMenuLabel({ className, ...props }, ref) {
    return <MenuPrimitive.Label ref={ref} className={cn('px-3 py-1.5 text-xs font-semibold text-text-muted', className)} {...props} />;
  },
);

export const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof MenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof MenuPrimitive.Separator>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return <MenuPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />;
});
