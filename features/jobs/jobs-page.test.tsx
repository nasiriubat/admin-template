import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, createDemoAuthAdapter, SESSION_COOKIE } from '@nexus/auth';
import { JobsPage } from './jobs-page';

vi.mock('../_shared/register-mocks', async () => {
  await import('./mock');
  return {};
});

function renderPage(userId: string) {
  document.cookie = `${SESSION_COOKIE}=${userId}; Path=/`;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider adapter={createDemoAuthAdapter()}>
        <JobsPage />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  document.cookie = `${SESSION_COOKIE}=; Max-Age=0; Path=/`;
});
afterEach(() => {
  document.cookie = `${SESSION_COOKIE}=; Max-Age=0; Path=/`;
});

describe('JobsPage', () => {
  it('shows queue metrics and the jobs table', async () => {
    renderPage('u-demo-editor');
    expect(await screen.findByRole('table', { name: 'Background jobs' }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText('Queue breakdown')).toBeInTheDocument();
    expect(await screen.findByText('Completed (24h)')).toBeInTheDocument();
  });

  it('hides retry and cancel actions without jobs.manage', async () => {
    renderPage('u-demo-editor');
    await screen.findByRole('table', { name: 'Background jobs' }, { timeout: 3000 });
    expect(screen.queryByRole('button', { name: /^Cancel job/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Retry job/ })).toBeNull();
  });

  it('asks for confirmation before cancelling a job', async () => {
    const user = userEvent.setup();
    renderPage('u-demo-admin');
    await screen.findByRole('table', { name: 'Background jobs' }, { timeout: 3000 });
    const cancelButtons = await screen.findAllByRole('button', { name: /^Cancel job/ }, { timeout: 3000 });
    await user.click(cancelButtons[0]);
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText(/will stop and won't be retried/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Keep job' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});
