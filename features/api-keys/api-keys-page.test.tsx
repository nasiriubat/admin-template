import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider, createDemoAuthAdapter } from '@nexus/auth';
import { ApiKeySecretDialog } from './api-key-secret-dialog';
import { ApiKeysPage } from './api-keys-page';
import type { CreatedApiKey } from './types';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/api-keys' }));

describe('ApiKeysPage', () => {
  it('lists keys with masked values and never a full secret', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <AuthProvider adapter={createDemoAuthAdapter()}>
          <ApiKeysPage />
        </AuthProvider>
      </QueryClientProvider>,
    );
    await waitFor(() => expect(screen.getAllByText('Production backend').length).toBeGreaterThan(0), { timeout: 4000 });
    expect(screen.getAllByText(/nxk_live_\w{4}••••\w{4}/).length).toBeGreaterThan(0);
  });
});

describe('ApiKeySecretDialog', () => {
  const created: CreatedApiKey = {
    secret: 'nxk_live_SECRETVALUE1234',
    key: { id: 'k', name: 'My key', prefix: 'nxk_live_SECR', last4: '1234', scopes: ['users:read'], status: 'active', createdAt: '', lastUsedAt: null, expiresAt: null, revokedAt: null },
  };
  it('shows the secret with a warning and copies it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const onClose = vi.fn();
    render(<ApiKeySecretDialog created={created} onClose={onClose} />);
    expect(screen.getByText(/won’t see this key again/)).toBeTruthy();
    expect(screen.getByTestId('api-key-secret').textContent).toBe(created.secret);
    screen.getByRole('button', { name: 'Copy API key' }).click();
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(created.secret));
    screen.getByRole('button', { name: /saved my key/ }).click();
    expect(onClose).toHaveBeenCalled();
  });
  it('renders nothing sensitive when closed', () => {
    render(<ApiKeySecretDialog created={null} onClose={() => {}} />);
    expect(screen.queryByTestId('api-key-secret')).toBeNull();
  });
});
