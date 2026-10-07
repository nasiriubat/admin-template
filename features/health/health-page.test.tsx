import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HealthPage } from './health-page';

vi.mock('../_shared/register-mocks', async () => {
  await import('./mock');
  return {};
});

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <HealthPage />
    </QueryClientProvider>,
  );
}

describe('HealthPage', () => {
  it('shows a loading state, then services, status banner and incidents', async () => {
    renderPage();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(await screen.findByRole('article', { name: 'Database' }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(7);
    expect(screen.getByText(/Degraded performance on 1 service/)).toBeInTheDocument();
    expect(screen.getByText('Delayed transactional email delivery')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Open incidents' })).toBeInTheDocument();
  });

  it('gives each uptime strip a text alternative and supports manual refresh', async () => {
    const user = userEvent.setup();
    renderPage();
    const card = await screen.findByRole('article', { name: 'Cache' }, { timeout: 3000 });
    expect(card.querySelector('ul[aria-label^="Cache:"]')).not.toBeNull();
    expect(card.querySelectorAll('ul li')).toHaveLength(30);

    await user.click(screen.getByRole('button', { name: /Refresh/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Refresh/ })).toBeEnabled(), { timeout: 3000 });
    expect(screen.getByRole('switch', { name: /Auto-refresh/ })).toBeChecked();
  });
});
