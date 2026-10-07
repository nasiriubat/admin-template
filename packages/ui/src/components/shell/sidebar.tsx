'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { isRouteActive, type NavGroupConfig } from '@nexus/config';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';
import { Tooltip } from '../ui/tooltip';
import { BrandMark } from './brand-mark';

export interface SidebarProps {
  groups: NavGroupConfig[];
  appName?: string;
  appVersion?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  /** Pinned keeps the chosen state. Unpinned + collapsed expands over the content on hover/focus. */
  isPinned: boolean;
  onTogglePin: () => void;
  className?: string;
}

const RAIL = 76;
const FULL = 264;

const badgeClass = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  primary: 'bg-primary/15 text-primary',
  neutral: 'bg-canvas text-text-muted border border-border',
} as const;

export function Sidebar({ groups, appName = 'Nexus Admin', appVersion, isCollapsed, onToggleCollapse, isPinned, onTogglePin, className }: SidebarProps) {
  const pathname = usePathname();
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const hoverExpand = isCollapsed && !isPinned && (hovering || focusWithin);
  const compact = isCollapsed && !hoverExpand;

  return (
    <aside
      aria-label="Primary"
      className={cn('relative z-30 hidden h-dvh shrink-0 md:block sticky top-0 transition-[width] duration-200 ease-out', className)}
      style={{ width: isCollapsed ? RAIL : FULL }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocusWithin(false);
      }}
    >
      <div
        className={cn(
          'absolute inset-y-0 left-0 flex flex-col border-r border-border bg-surface text-text transition-[width] duration-200 ease-out',
          hoverExpand && 'shadow-popover',
        )}
        style={{ width: compact ? RAIL : FULL }}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
          <Link href="/" className="flex min-w-0 items-center gap-3 rounded-lg" aria-label={`${appName} home`}>
            <BrandMark />
            {!compact && (
              <span className="flex min-w-0 flex-col">
                <span className="flex items-center gap-2">
                  <span className="truncate text-base font-semibold tracking-tight">{appName}</span>
                  {appVersion && (
                    <span className="rounded border border-border bg-canvas px-1.5 py-0.5 text-[10px] font-medium text-text-muted">v{appVersion}</span>
                  )}
                </span>
              </span>
            )}
          </Link>
        </div>

        <nav aria-label="Main" className="custom-scrollbar flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-4">
          {groups.map((group) => (
            <div key={group.id} className="space-y-1" role="group" aria-labelledby={`nav-${group.id}`}>
              {compact ? (
                <div className="flex justify-center py-1" aria-hidden="true">
                  <div className="h-0.5 w-4 rounded-full bg-border" />
                </div>
              ) : (
                <div id={`nav-${group.id}`} className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {group.title}
                </div>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isRouteActive(pathname, item.href);
                  const link = (
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      aria-label={compact ? item.label : undefined}
                      className={cn(
                        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                        compact && 'justify-center px-0',
                        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-muted hover:bg-canvas hover:text-text',
                      )}
                    >
                      <IconRenderer name={item.icon} className="size-5 shrink-0" />
                      {!compact && <span className="flex-1 truncate">{item.label}</span>}
                      {!compact && item.badge && (
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[11px] font-medium',
                            active ? 'bg-primary-foreground/20 text-primary-foreground' : badgeClass[item.badge.variant ?? 'neutral'],
                          )}
                        >
                          {item.badge.text}
                        </span>
                      )}
                    </Link>
                  );
                  return <li key={item.id}>{compact ? <Tooltip content={item.label}>{link}</Tooltip> : link}</li>;
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 border-t border-border p-3">
          <Tooltip content={isCollapsed ? 'Expand sidebar (Ctrl/⌘ B)' : 'Collapse sidebar (Ctrl/⌘ B)'}>
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={cn('flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-text-muted hover:bg-canvas hover:text-text')}
            >
              <IconRenderer name={isCollapsed ? 'ChevronsRight' : 'ChevronsLeft'} className="size-4" />
              {!compact && <span className="text-xs font-medium">Collapse</span>}
            </button>
          </Tooltip>
          <Tooltip content={isPinned ? 'Sidebar stays as set. Click to expand on hover when collapsed' : 'Expands on hover when collapsed. Click to pin'}>
            <button
              type="button"
              onClick={onTogglePin}
              aria-pressed={isPinned}
              aria-label="Pin sidebar state"
              className={cn('grid size-10 shrink-0 place-items-center rounded-xl hover:bg-canvas', isPinned ? 'text-primary' : 'text-text-muted hover:text-text')}
            >
              <IconRenderer name={isPinned ? 'Pin' : 'PinOff'} className="size-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
