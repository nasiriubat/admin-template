import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LogsPage } from './logs-page';

vi.mock('../_shared/register-mocks', async () => {
  await import('./mock');
  return {};
});

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <LogsPage />
    </QueryClientProvider>,
  );
}

describe('LogsPage', () => {
  it('lists log entries from the server and expands JSON context', async () => {
    const user = userEvent.setup();
    renderPage();
    const table = await screen.findByRole('table', { name: /Application logs/ }, { timeout: 3000 });
    expect(within(table).getAllByRole('row').length).toBeGreaterThan(5);

    await user.click(within(table).getAllByRole('button', { name: 'Expand row' })[0]);
    const pre = (await screen.findAllByLabelText(/JSON context for request/))[0];
    expect(pre.tagName).toBe('PRE');
    expect(pre.textContent).toContain('{');
  });

  it('toggles live tail with a visible state and filters by level', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('table', { name: /Application logs/ }, { timeout: 3000 });

    await user.click(screen.getAllByRole('switch', { name: 'Live tail' })[0]);
    expect(screen.getByText('Live')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Pause/ }));
    expect(screen.getByText('Paused by you')).toBeInTheDocument();

    const errorToggle = screen.getAllByRole('button', { name: 'Error' })[0];
    await user.click(errorToggle);
    expect(errorToggle).toHaveAttribute('aria-pressed', 'true');
  });
});
