'use client';

import { NotificationBell } from '@nexus/ui';
import { useMarkAllRead, useNotifications, useSetNotificationRead } from './hooks';

const BELL_LIMIT = 10;

/** Top-bar bell backed by `GET /notifications`. The full list lives on /notifications. */
export function NotificationsMenu() {
  const query = useNotifications();
  const markAll = useMarkAllRead();
  const setRead = useSetNotificationRead();

  return (
    <NotificationBell
      items={query.data?.slice(0, BELL_LIMIT)}
      loading={query.isPending}
      error={query.isError ? query.error : undefined}
      onRetry={() => void query.refetch()}
      onMarkAllRead={() => markAll.mutate(undefined)}
      onMarkRead={(id) => setRead.mutate({ id, read: true })}
      viewAllHref="/notifications"
    />
  );
}
