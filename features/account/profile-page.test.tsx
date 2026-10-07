import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ProfilePage } from './profile-page';

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ProfilePage />
    </QueryClientProvider>,
  );
}

describe('ProfilePage', () => {
  it('loads the profile form and validates the name', async () => {
    renderPage();
    const name = (await screen.findByLabelText(/Full name/, undefined, { timeout: 3000 })) as HTMLInputElement;
    expect(name.value).toBe('Avery Morgan');
    fireEvent.change(name, { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Enter at least 2 characters.')).toBeTruthy();
  });

  it('lists sessions and marks the current one', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('tab', { name: 'Sessions' }));
    expect(await screen.findByText('This device', undefined, { timeout: 3000 })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /Revoke session on/ }).length).toBe(3);
  });

  it('asks for confirmation before revoking a session', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('tab', { name: 'Sessions' }));
    const [first] = await screen.findAllByRole('button', { name: /Revoke session on/ }, { timeout: 3000 });
    await user.click(first);
    expect(await screen.findByRole('alertdialog')).toBeTruthy();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Revoke session' })).toBeTruthy());
  });

  it('shows password mismatch errors on the security tab', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('tab', { name: 'Security' }));
    await user.type(await screen.findByLabelText(/Current password/), 'old-password-1');
    await user.type(screen.getByLabelText(/^New password/), 'Brand-new-pass9');
    await user.type(screen.getByLabelText(/Confirm new password/), 'nope');
    await user.click(screen.getByRole('button', { name: 'Update password' }));
    expect(await screen.findByText('Passwords do not match.')).toBeTruthy();
  });
});
