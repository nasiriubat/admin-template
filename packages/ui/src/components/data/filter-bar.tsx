'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../ui/dialog';

export interface FilterBarProps {
  /** Filter controls (Selects, date inputs…). Rendered inline on desktop, in a bottom sheet on mobile. */
  children: ReactNode;
  activeCount: number;
  onClear: () => void;
  className?: string;
}

/** Quick filters: inline row on desktop, "Filters (n)" bottom sheet on mobile. */
export function FilterBar({ children, activeCount, onClear, className }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={className}>
      <div className={cn('hidden flex-wrap items-center gap-2 md:flex')}>
        {children}
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="secondary" className="w-full">
              <IconRenderer name="Filter" className="size-4" />
              Filters
              {activeCount > 0 && <Badge variant="primary">{activeCount}</Badge>}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Narrow the list. Results update as you choose.</SheetDescription>
            </SheetHeader>
            <SheetBody className="space-y-4 pb-4">{children}</SheetBody>
            <SheetFooter>
              <Button variant="secondary" onClick={onClear} disabled={activeCount === 0}>
                Clear all
              </Button>
              <Button onClick={() => setOpen(false)}>Show results</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
