import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider, createDemoAuthAdapter } from '@nexus/auth';
import { BillingPage } from './billing-page';

function renderPage(userId: string) {
  document.cookie = `nexus_session=${userId}; Path=/`;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider adapter={createDemoAuthAdapter()}>
        <BillingPage />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('BillingPage', () => {
  beforeEach(() => {
    document.cookie = 'nexus_session=; Max-Age=0; Path=/';
  });

  it('shows plan, usage meters and card brand with last4 only', async () => {
    renderPage('u-demo-admin');
    expect(await screen.findByText(/Visa ending in 4242/, undefined, { timeout: 4000 })).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: 'Seats' }).getAttribute('aria-valuenow')).toBe('19');
    expect(screen.getByRole('progressbar', { name: 'API requests' })).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: 'Storage' })).toBeTruthy();
  });

  it('requires typed confirmation to cancel and states card entry must be hosted', async () => {
    renderPage('u-demo-admin');
    fireEvent.click(await screen.findByRole('button', { name: 'Update' }, { timeout: 4000 }));
    expect(await screen.findByText(/payment provider’s hosted fields/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(await screen.findByRole('button', { name: /Cancel subscription…/ }));
    const confirm = await screen.findByRole('button', { name: 'Cancel subscription' });
    expect((confirm as HTMLButtonElement).disabled).toBe(true);
  });

  it('hides management actions from viewers', async () => {
    renderPage('u-demo-viewer');
    await screen.findByText(/Visa ending in 4242/, undefined, { timeout: 4000 });
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Update' })).toBeNull());
    expect(screen.queryByRole('button', { name: /Cancel subscription/ })).toBeNull();
  });
});
