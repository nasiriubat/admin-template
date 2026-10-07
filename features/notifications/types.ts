import type { NotificationItem } from '@nexus/ui';

/** Same shape the top-bar bell renders, so the API payload can be passed straight through. */
export type Notification = NotificationItem;

export type NotificationFilter = 'all' | 'unread';
