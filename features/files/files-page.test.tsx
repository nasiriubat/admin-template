import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider, createDemoAuthAdapter } from '@nexus/auth';
import { FilesPage } from './files-page';

function renderPage(userId: string) {
  document.cookie = `nexus_session=${userId}; Path=/`;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider adapter={createDemoAuthAdapter()}>
        <FilesPage />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('FilesPage', () => {
  beforeEach(() => {
    document.cookie = 'nexus_session=; Max-Age=0; Path=/';
  });

  it('lists files and offers upload and management to managers', async () => {
    renderPage('u-demo-admin');
    expect(await screen.findByText('Q3-board-report.pdf', undefined, { timeout: 3000 })).toBeTruthy();
    expect(await screen.findByTestId('file-input')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /Actions for/ }).length).toBeGreaterThan(0);
  });

  it('shows per-file validation errors for disallowed uploads', async () => {
    renderPage('u-demo-admin');
    const input = await screen.findByTestId('file-input');
    const bad = new File(['x'], 'malware.exe', { type: 'application/octet-stream' });
    fireEvent.change(input, { target: { files: [bad] } });
    expect(await screen.findByText(/\.exe files are not allowed/)).toBeTruthy();
  });

  it('is read-only for viewers without files.manage', async () => {
    renderPage('u-demo-viewer');
    await waitFor(() => expect(screen.getAllByRole('button', { name: /Copy link for/ }).length).toBeGreaterThan(0), { timeout: 3000 });
    expect(screen.queryByTestId('file-input')).toBeNull();
    expect(screen.queryByRole('button', { name: /Actions for/ })).toBeNull();
  });
});
