import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AuditEvent } from './types';

const event: AuditEvent = {
  id: 'aud-0001',
  actorId: 'u-001',
  actorName: 'Avery Morgan',
  actorEmail: 'avery.morgan@example.com',
  action: 'update',
  resourceType: 'user',
  resourceId: 'u-007',
  ip: '203.0.113.24',
  userAgent: 'Chrome 126 on macOS',
  timestamp: '2026-03-01T10:00:00.000Z',
  oldValue: { role: 'viewer' },
  newValue: { role: 'editor' },
};

vi.mock('gsap', () => ({ gsap: { registerPlugin: () => {} } }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));
vi.mock('@nexus/auth', () => ({ useCan: () => true }));
vi.mock('./service', () => ({
  auditService: {
    list: vi.fn(async () => ({ items: [event], meta: { page: 1, pageSize: 10, total: 1, pages: 1 } })),
    listAll: vi.fn(async () => [event]),
  },
}));

import { AuditPage } from './audit-page';

describe('AuditPage', () => {
  it('lists events and expands a row to show the before/after diff', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <AuditPage />
      </QueryClientProvider>,
    );
    expect((await screen.findAllByText('avery.morgan@example.com')).length).toBeGreaterThan(0);
    const toggle = screen.getAllByRole('button', { name: /expand|details|show/i })[0];
    await user.click(toggle);
    expect((await screen.findAllByText('editor')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('viewer').length).toBeGreaterThan(0);
  });

  it('warns when the date range is reversed', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <AuditPage />
      </QueryClientProvider>,
    );
    await screen.findAllByText('avery.morgan@example.com');
    await user.type(screen.getAllByLabelText('From date')[0], '2026-03-05');
    await user.type(screen.getAllByLabelText('To date')[0], '2026-03-01');
    expect((await screen.findAllByText(/on or after the start date/)).length).toBeGreaterThan(0);
  });
});
