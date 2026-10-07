'use client';

import Link from 'next/link';
import { safeRedirectPath } from '@nexus/config';
import { useState } from 'react';
import { useCan } from '@nexus/auth';
import {
  Badge,
  Button,
  Card,
  cn,
  ConfirmDialog,
  EmptyState,
  formatRelative,
  IconRenderer,
  PageContainer,
  PageHeader,
  QueryBoundary,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
  UnauthorizedState,
} from '@nexus/ui';
import { useDeleteNotification, useMarkAllRead, useNotifications, useSetNotificationRead } from './hooks';
import type { Notification, NotificationFilter } from './types';

const toneIcon = { info: 'Info', success: 'CheckCircle2', warning: 'AlertTriangle', danger: 'AlertCircle' } as const;
const toneClass = { info: 'bg-info/15 text-info', success: 'bg-success/15 text-success', warning: 'bg-warning/15 text-warning', danger: 'bg-danger/15 text-danger' } as const;

function ListSkeleton() {
  return (
    <Card className="divide-y divide-border" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 p-4">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </Card>
  );
}

function Row({ item, onToggle, onDelete, busy }: { item: Notification; onToggle: () => void; onDelete: () => void; busy: boolean }) {
  const tone = item.tone ?? 'info';
  return (
    <li className={cn('flex flex-col gap-3 p-4 sm:flex-row sm:items-start', !item.read && 'bg-primary/5')}>
      <div className="flex min-w-0 flex-1 gap-3">
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-full', toneClass[tone])}>
          <IconRenderer name={toneIcon[tone]} className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn('text-sm text-text', item.read ? 'font-medium' : 'font-semibold')}>{item.title}</h3>
            {!item.read && <Badge variant="primary">Unread</Badge>}
          </div>
          {item.body && <p className="mt-0.5 text-sm text-text-muted">{item.body}</p>}
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-text-muted">
            <time dateTime={item.createdAt}>{formatRelative(item.createdAt)}</time>
            {item.href && safeRedirectPath(item.href, '') && (
              <Link href={safeRedirectPath(item.href, '')} className="font-medium text-primary hover:underline">
                View
              </Link>
            )}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:ml-2">
        <Button variant="ghost" size="sm" disabled={busy} onClick={onToggle} aria-label={`${item.read ? 'Mark as unread' : 'Mark as read'}: ${item.title}`}>
          <IconRenderer name={item.read ? 'Mail' : 'MailOpen'} className="size-4" />
          {item.read ? 'Mark unread' : 'Mark read'}
        </Button>
        <Button variant="danger-ghost" size="icon" onClick={onDelete} aria-label={`Delete notification: ${item.title}`}>
          <IconRenderer name="Trash2" className="size-4" />
        </Button>
      </div>
    </li>
  );
}

export function NotificationsPage() {
  const canView = useCan('notifications.view');
  const query = useNotifications();
  const setRead = useSetNotificationRead();
  const markAll = useMarkAllRead();
  const remove = useDeleteNotification();
  const [tab, setTab] = useState<NotificationFilter>('all');
  const [deleting, setDeleting] = useState<Notification | null>(null);

  if (!canView) return <UnauthorizedState size="page" />;

  const unread = query.data?.filter((n) => !n.read).length ?? 0;

  async function toggle(item: Notification) {
    try {
      await setRead.mutateAsync({ id: item.id, read: !item.read });
    } catch (e) {
      toast.error('Could not update notification', { description: e instanceof Error ? e.message : undefined });
    }
  }

  async function readAll() {
    try {
      await markAll.mutateAsync(undefined);
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error('Could not mark all as read', { description: e instanceof Error ? e.message : undefined });
    }
  }

  const renderList = (all: Notification[], filter: NotificationFilter) => {
    const shown = filter === 'unread' ? all.filter((n) => !n.read) : all;
    if (shown.length === 0) {
      return (
        <Card>
          <EmptyState
            icon={filter === 'unread' ? 'CheckCheck' : 'Bell'}
            title={filter === 'unread' ? 'You’re all caught up' : 'No notifications'}
            description={filter === 'unread' ? 'There’s nothing unread right now.' : 'Alerts about your workspace will show up here.'}
          />
        </Card>
      );
    }
    return (
      <Card>
        <ul className="divide-y divide-border">
          {shown.map((n) => (
            <Row key={n.id} item={n} busy={setRead.isPending} onToggle={() => void toggle(n)} onDelete={() => setDeleting(n)} />
          ))}
        </ul>
      </Card>
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        description="Alerts and activity that need your attention."
        actions={
          <Button variant="secondary" disabled={unread === 0} loading={markAll.isPending} onClick={() => void readAll()}>
            <IconRenderer name="CheckCheck" className="size-4" /> Mark all read
          </Button>
        }
      />

      <QueryBoundary query={query} loading={<ListSkeleton />}>
        {(items) => (
          <Tabs value={tab} onValueChange={(v) => setTab(v as NotificationFilter)}>
            <TabsList aria-label="Filter notifications">
              <TabsTrigger value="all">All ({items.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unread})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">{renderList(items, 'all')}</TabsContent>
            <TabsContent value="unread">{renderList(items, 'unread')}</TabsContent>
          </Tabs>
        )}
      </QueryBoundary>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this notification?"
        description={deleting ? `“${deleting.title}” will be removed from your list. This can’t be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success('Notification deleted');
        }}
      />
    </PageContainer>
  );
}
