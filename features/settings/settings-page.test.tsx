import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider, createDemoAuthAdapter } from '@nexus/auth';
import { SettingsPage } from './settings-page';

function renderPage(userId: string) {
  document.cookie = `nexus_session=${userId}; Path=/`;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider adapter={createDemoAuthAdapter()}>
        <SettingsPage />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    document.cookie = 'nexus_session=; Max-Age=0; Path=/';
  });

  it('loads the general form and enables saving after an edit', async () => {
    renderPage('u-demo-admin');
    const name = await screen.findByLabelText(/Workspace name/, undefined, { timeout: 3000 });
    expect((name as HTMLInputElement).value).toBe('Nexus Workspace');
    const save = screen.getByRole('button', { name: 'Save changes' }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
    fireEvent.change(name, { target: { value: 'Acme Studio' } });
    await waitFor(() => expect((screen.getByRole('button', { name: 'Save changes' }) as HTMLButtonElement).disabled).toBe(false));
  });

  it('shows a validation error for an invalid support email', async () => {
    renderPage('u-demo-admin');
    const email = await screen.findByLabelText(/Support email/, undefined, { timeout: 3000 });
    fireEvent.change(email, { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Enter a valid email address.')).toBeTruthy();
  });

  it('is read-only with an explanatory banner for users without settings.manage', async () => {
    renderPage('u-demo-editor');
    expect(await screen.findByText('Read-only access', undefined, { timeout: 3000 })).toBeTruthy();
    const name = (await screen.findByLabelText(/Workspace name/, undefined, { timeout: 3000 })) as HTMLInputElement;
    expect(name.matches(":disabled")).toBe(true);
    expect(screen.queryByRole('button', { name: 'Save changes' })).toBeNull();
  });
});
