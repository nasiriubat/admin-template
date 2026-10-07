import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Notification } from './types';

const items: Notification[] = [
  { id: 'a', title: 'Deployment finished', body: 'Release is live.', createdAt: new Date().toISOString(), read: false, tone: 'success' },
  { id: 'b', title: 'Storage at 82%', body: 'Nearing the limit.', createdAt: new Date().toISOString(), read: true, tone: 'warning' },
];

vi.mock('gsap', () => ({ gsap: { registerPlugin: () => {} } }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));
vi.mock('@nexus/auth', () => ({ useCan: () => true }));
vi.mock('./service', () => ({
  notificationsService: {
    list: vi.fn(async () => items),
    setRead: vi.fn(async () => items[0]),
    markAllRead: vi.fn(async () => ({ affected: 1 })),
    remove: vi.fn(async () => undefined),
  },
}));

import { NotificationsMenu } from './notifications-menu';
import { NotificationsPage } from './notifications-page';
import { notificationsService } from './service';

const wrap = (ui: ReactNode) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider>
);

describe('NotificationsMenu', () => {
  it('shows the unread count on the bell', async () => {
    render(wrap(<NotificationsMenu />));
    expect(await screen.findByRole('button', { name: 'Notifications, 1 unread' })).toBeTruthy();
  });
});

describe('NotificationsPage', () => {
  it('filters to unread and marks a notification read', async () => {
    const user = userEvent.setup();
    render(wrap(<NotificationsPage />));
    expect(await screen.findByText('Storage at 82%')).toBeTruthy();
    await user.click(screen.getByRole('tab', { name: /Unread/ }));
    expect(screen.queryByText('Storage at 82%')).toBeNull();
    await user.click(screen.getByRole('button', { name: /Mark as read: Deployment finished/ }));
    await waitFor(() => expect(vi.mocked(notificationsService.setRead).mock.calls[0].slice(0, 2)).toEqual(['a', true]));
  });

  it('asks for confirmation before deleting', async () => {
    const user = userEvent.setup();
    render(wrap(<NotificationsPage />));
    await user.click(await screen.findByRole('button', { name: /Delete notification: Storage at 82%/ }));
    expect(notificationsService.remove).not.toHaveBeenCalled();
    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(vi.mocked(notificationsService.remove).mock.calls[0][0]).toBe('b'));
  });
});
