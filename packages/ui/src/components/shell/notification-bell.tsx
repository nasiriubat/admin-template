'use client';

import * as Popover from '@radix-ui/react-popover';
import Link from 'next/link';
import { safeRedirectPath } from '@nexus/config';
import { cn } from '../../lib/utils';
import { formatRelative } from '../../lib/format';
import { IconRenderer } from '../icons/icon-renderer';
import { ErrorState } from '../patterns/error-state';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  createdAt: string;
  read: boolean;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  href?: string;
}

export interface NotificationBellProps {
  items: NotificationItem[] | undefined;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onMarkAllRead?: () => void;
  onMarkRead?: (id: string) => void;
  viewAllHref?: string;
}

const toneIcon = { info: 'Info', success: 'CheckCircle2', warning: 'AlertTriangle', danger: 'AlertCircle' } as const;
const toneClass = { info: 'bg-info/15 text-info', success: 'bg-success/15 text-success', warning: 'bg-warning/15 text-warning', danger: 'bg-danger/15 text-danger' } as const;

export function NotificationBell({ items, loading, error, onRetry, onMarkAllRead, onMarkRead, viewAllHref }: NotificationBellProps) {
  const unread = items?.filter((n) => !n.read).length ?? 0;
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
          className="relative grid size-10 place-items-center rounded-xl text-text-muted hover:bg-canvas hover:text-text data-[state=open]:bg-canvas data-[state=open]:text-primary [@media(pointer:coarse)]:size-11"
        >
          <IconRenderer name="Bell" className="size-5" />
          {unread > 0 && (
            <span aria-hidden="true" className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full border-2 border-surface bg-danger px-1 text-[10px] font-bold leading-4 text-danger-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={8}
          className="z-[60] w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-card border border-border bg-surface-elevated text-text shadow-popover animate-pop-in"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Notifications</h2>
            {unread > 0 && onMarkAllRead && (
              <Button variant="link" size="sm" onClick={onMarkAllRead}>
                Mark all read
              </Button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="space-y-4 p-4" role="status" aria-label="Loading notifications">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <ErrorState error={error} onRetry={onRetry} />
            ) : !items?.length ? (
              <p className="px-4 py-10 text-center text-sm text-text-muted">You’re all caught up.</p>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((n) => {
                  const tone = n.tone ?? 'info';
                  const body = (
                    <>
                      <span className={cn('grid size-8 shrink-0 place-items-center rounded-full', toneClass[tone])}>
                        <IconRenderer name={toneIcon[tone]} className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className={cn('block text-sm', n.read ? 'font-medium' : 'font-semibold')}>{n.title}</span>
                        {n.body && <span className="block truncate text-xs text-text-muted">{n.body}</span>}
                        <span className="mt-0.5 block text-[11px] text-text-muted">{formatRelative(n.createdAt)}</span>
                      </span>
                      {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                    </>
                  );
                  const cls = 'flex w-full gap-3 px-4 py-3 hover:bg-canvas';
                  // Server-provided links must stay in-app (blocks external phishing links).
                  const safeHref = n.href ? safeRedirectPath(n.href, '') : '';
                  return (
                    <li key={n.id}>
                      {safeHref ? (
                        <Popover.Close asChild>
                          <Link href={safeHref} className={cls} onClick={() => onMarkRead?.(n.id)}>
                            {body}
                          </Link>
                        </Popover.Close>
                      ) : (
                        <button type="button" className={cls} onClick={() => onMarkRead?.(n.id)}>
                          {body}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {viewAllHref && (
            <div className="border-t border-border p-2 text-center">
              <Popover.Close asChild>
                <Link href={viewAllHref} className="inline-block rounded-md px-3 py-1.5 text-sm font-medium text-primary hover:underline">
                  View all notifications
                </Link>
              </Popover.Close>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
