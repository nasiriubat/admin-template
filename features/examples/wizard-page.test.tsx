import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({ default: ({ href, children, ...p }: { href: string; children: React.ReactNode }) => <a href={href} {...p}>{children}</a> }));

import { WizardPage } from './wizard-page';

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <WizardPage />
    </QueryClientProvider>,
  );
}
const T = { timeout: 4000 };

describe('WizardPage', () => {
  it('shows the example banner and marks the first step current', () => {
    renderPage();
    expect(screen.getByRole('region', { name: /example page/i })).toHaveTextContent(/remove features\/examples/);
    const current = screen.getAllByRole('listitem').find((li) => li.getAttribute('aria-current') === 'step');
    expect(current).toHaveTextContent('Account');
  });

  it('validates each step before moving on', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Enter at least 3 characters.')).toBeInTheDocument();
    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByLabelText(/workspace name/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('walks through review and ends in the success state', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText(/workspace name/i), 'Acme Labs');
    await user.type(screen.getByLabelText(/admin email/i), 'owner@acme.test');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(await screen.findByRole('textbox', { name: /invite teammates/i }), 'teammate@acme.test{Enter}');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Acme Labs')).toBeInTheDocument();
    expect(screen.getByText('teammate@acme.test')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /create workspace/i }));
    expect(await screen.findByText('Workspace created', undefined, T)).toBeInTheDocument();
    expect(screen.getByText(/ONB-\d{4}/)).toBeInTheDocument();
  });

  it('warns before unload once the form has unsaved input', async () => {
    const user = userEvent.setup();
    renderPage();
    const before = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(before);
    expect(before.defaultPrevented).toBe(false);
    await user.type(screen.getByLabelText(/workspace name/i), 'Acme');
    await waitFor(() => {
      const evt = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(evt);
      expect(evt.defaultPrevented).toBe(true);
    });
  });
});
