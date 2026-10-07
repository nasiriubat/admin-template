'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from './service';

export const notificationKeys = { all: ['notifications'] as const };

export const NOTIFICATIONS_POLL_MS = 60_000;

/** Shared by the bell and the full page, so one request feeds both. Polls every minute. */
export const useNotifications = () =>
  useQuery({
    queryKey: notificationKeys.all,
    queryFn: ({ signal }) => notificationsService.list(signal),
    refetchInterval: NOTIFICATIONS_POLL_MS,
  });

function useInvalidatingMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }) });
}

export const useSetNotificationRead = () => useInvalidatingMutation(({ id, read }: { id: string; read: boolean }) => notificationsService.setRead(id, read));
export const useMarkAllRead = () => useInvalidatingMutation(() => notificationsService.markAllRead());
export const useDeleteNotification = () => useInvalidatingMutation(notificationsService.remove);
