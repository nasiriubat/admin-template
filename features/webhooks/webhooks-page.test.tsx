import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider, createDemoAuthAdapter } from '@nexus/auth';
import { WebhookSecretDialog } from './webhook-secret-dialog';
import { WebhooksPage } from './webhooks-page';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/webhooks' }));

describe('WebhooksPage', () => {
  it('lists endpoints with enable switches', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <AuthProvider adapter={createDemoAuthAdapter()}>
          <WebhooksPage />
        </AuthProvider>
      </QueryClientProvider>,
    );
    await waitFor(() => expect(screen.getAllByText('https://api.acme-crm.com/hooks/nexus').length).toBeGreaterThan(0), { timeout: 4000 });
    expect(screen.getAllByRole('switch', { name: /Enable https:\/\/api\.acme-crm\.com/ }).length).toBeGreaterThan(0);
  });
});

describe('WebhookSecretDialog', () => {
  it('shows the secret once with a warning and clears on close', () => {
    const onClose = vi.fn();
    render(<WebhookSecretDialog secret="whsec_abc123" title="Your signing secret" onClose={onClose} />);
    expect(screen.getByTestId('webhook-secret').textContent).toBe('whsec_abc123');
    expect(screen.getByText(/won’t see this secret again/)).toBeTruthy();
    screen.getByRole('button', { name: /saved the secret/ }).click();
    expect(onClose).toHaveBeenCalled();
  });
});
