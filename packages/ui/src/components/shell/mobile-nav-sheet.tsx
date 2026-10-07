'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { isRouteActive, type NavGroupConfig } from '@nexus/config';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';
import { Button } from '../ui/button';
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../ui/dialog';
import { Avatar } from '../ui/avatar';
import { BrandMark } from './brand-mark';
import { ThemeControls } from './theme-controls';
import type { ShellUser } from './top-bar';

export interface MobileNavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: NavGroupConfig[];
  appName: string;
  user?: ShellUser | null;
  onSignOut?: () => void;
}

/**
 * Full information architecture for small screens. Built on Radix Dialog so it traps focus,
 * closes on Escape, restores focus to the "More" button and locks background scroll.
 */
export function MobileNavSheet({ open, onOpenChange, groups, appName, user, onSignOut }: MobileNavSheetProps) {
  const pathname = usePathname();
  const lastPath = useRef(pathname);

  // Close after navigating. Compares against the previous pathname so merely opening the sheet
  // (which re-renders the parent) can never close it.
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      onOpenChange(false);
    }
  }, [pathname, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" aria-describedby={undefined} className="w-[88%] max-w-sm md:hidden">
        <SheetHeader className="flex-row items-center gap-3 border-b border-border pb-4">
          <BrandMark className="size-9 text-base" />
          <div className="min-w-0">
            <SheetTitle className="truncate text-base">{appName}</SheetTitle>
            <SheetDescription className="sr-only">Navigate to any section of the application</SheetDescription>
          </div>
        </SheetHeader>

        <SheetBody className="space-y-6 py-4">
          <nav aria-label="All sections" className="space-y-5">
            {groups.map((group) => (
              <div key={group.id} role="group" aria-labelledby={`m-nav-${group.id}`} className="space-y-1">
                <div id={`m-nav-${group.id}`} className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {group.title}
                </div>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isRouteActive(pathname, item.href);
                    return (
                      <li key={item.id}>
                        <SheetClose asChild>
                          <Link
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'flex min-h-11 items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium',
                              active ? 'bg-primary text-primary-foreground' : 'text-text-muted hover:bg-canvas hover:text-text',
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <IconRenderer name={item.icon} className="size-5" />
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className={cn('rounded-full px-2 py-0.5 text-[11px]', active ? 'bg-primary-foreground/20' : 'border border-border bg-canvas text-text-muted')}>
                                {item.badge.text}
                              </span>
                            )}
                          </Link>
                        </SheetClose>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <section aria-label="Appearance" className="space-y-3 border-t border-border pt-4">
            <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Appearance</h2>
            <ThemeControls />
          </section>
        </SheetBody>

        {user && (
          <SheetFooter className="flex-row items-center justify-between sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={user.name} src={user.avatarUrl} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-text-muted">{user.email}</p>
              </div>
            </div>
            {onSignOut && (
              <Button variant="danger-ghost" size="icon" aria-label="Sign out" onClick={onSignOut}>
                <IconRenderer name="LogOut" className="size-4" />
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
