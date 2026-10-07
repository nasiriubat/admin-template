'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isRouteActive, type NavItemConfig } from '@nexus/config';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';

export interface MobileBottomNavProps {
  /** Up to four primary destinations; the fifth slot is always "More". */
  items: NavItemConfig[];
  onOpenMenu: () => void;
  menuOpen?: boolean;
  className?: string;
}

/** Fixed bottom bar for primary destinations. Safe-area aware; never covers page content (see AppShell padding). */
export function MobileBottomNav({ items, onOpenMenu, menuOpen, className }: MobileBottomNavProps) {
  const pathname = usePathname();
  const tab = 'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-medium active:scale-95 transition-transform';

  return (
    <nav
      aria-label="Primary mobile"
      className={cn('fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-safe backdrop-blur-lg md:hidden', className)}
    >
      <ul className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
        {items.map((item) => {
          const active = isRouteActive(pathname, item.href);
          return (
            <li key={item.id} className="flex flex-1">
              <Link href={item.href} aria-current={active ? 'page' : undefined} className={cn(tab, active ? 'text-primary' : 'text-text-muted hover:text-text')}>
                <span className={cn('grid h-7 w-12 place-items-center rounded-full transition-colors', active && 'bg-primary/10')}>
                  <IconRenderer name={item.icon} className="size-5" />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <button type="button" onClick={onOpenMenu} aria-haspopup="dialog" aria-expanded={menuOpen} className={cn(tab, 'text-text-muted hover:text-text')}>
            <span className="grid h-7 w-12 place-items-center rounded-full">
              <IconRenderer name="Menu" className="size-5" />
            </span>
            <span>More</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
