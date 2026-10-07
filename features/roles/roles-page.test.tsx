import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Role } from './types';

const roles: Role[] = [
  { id: 'admin', name: 'Admin', description: 'Runs things.', system: true, permissions: ['users.view'], memberCount: 3 },
  { id: 'support', name: 'Support', description: 'Helps.', system: false, permissions: [], memberCount: 0 },
];

vi.mock('gsap', () => ({ gsap: { registerPlugin: () => {} } }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));
vi.mock('@nexus/auth', () => ({ useCan: () => true }));
vi.mock('./service', () => ({
  rolesService: {
    list: vi.fn(async () => roles),
    permissions: vi.fn(async () => [
      { id: 'users.view', label: 'View users', moduleId: 'users', moduleTitle: 'Users' },
      { id: 'users.manage', label: 'Manage users', moduleId: 'users', moduleTitle: 'Users' },
    ]),
    create: vi.fn(),
    update: vi.fn(async () => roles[0]),
    remove: vi.fn(),
  },
}));

import { RolesPage } from './roles-page';
import { rolesService } from './service';

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <RolesPage />
    </QueryClientProvider>,
  );
}

describe('RolesPage', () => {
  it('shows the permission matrix and enables saving after a change', async () => {
    const user = userEvent.setup();
    renderPage();
    const toggle = await screen.findByRole('switch', { name: /Manage users/ });
    expect(screen.getByText('All changes saved')).toBeTruthy();
    await user.click(toggle);
    expect(screen.getByText('You have unsaved changes')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(rolesService.update).toHaveBeenCalledWith('admin', { permissions: ['users.manage', 'users.view'] }));
  });
});
