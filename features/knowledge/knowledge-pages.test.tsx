import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider, createDemoAuthAdapter } from '@nexus/auth';
import { KnowledgeDocumentsPage } from './knowledge-documents-page';
import { KnowledgeSourcesPage } from './knowledge-sources-page';

function renderPage(userId: string, page: ReactElement) {
  document.cookie = `nexus_session=${userId}; Path=/`;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider adapter={createDemoAuthAdapter()}>{page}</AuthProvider>
    </QueryClientProvider>,
  );
}

describe('Knowledge pages', () => {
  beforeEach(() => {
    document.cookie = 'nexus_session=; Max-Age=0; Path=/';
  });

  it('lists documents and shows per-file upload errors', async () => {
    renderPage('u-demo-admin', <KnowledgeDocumentsPage />);
    expect(await screen.findAllByText('Getting started', undefined, { timeout: 4000 })).toBeTruthy();
    const input = await screen.findByTestId('document-input');
    fireEvent.change(input, { target: { files: [new File(['<svg/>'], 'logo.svg', { type: 'image/svg+xml' })] } });
    expect(await screen.findByText(/\.svg files are not allowed/)).toBeTruthy();
  });

  it('is read-only for viewers', async () => {
    renderPage('u-demo-viewer', <KnowledgeDocumentsPage />);
    await screen.findAllByText('Getting started', undefined, { timeout: 4000 });
    expect(screen.queryByTestId('document-input')).toBeNull();
    expect(screen.queryByRole('button', { name: /Actions for/ })).toBeNull();
  });

  it('lists sources with management controls for managers and a masked credential note', async () => {
    renderPage('u-demo-admin', <KnowledgeSourcesPage />);
    expect(await screen.findByText('Engineering handbook', undefined, { timeout: 4000 })).toBeTruthy();
    expect(screen.getAllByRole('switch').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /Delete Engineering handbook/ }));
    const confirm = await screen.findByRole('button', { name: 'Delete source' });
    expect((confirm as HTMLButtonElement).disabled).toBe(true);
  });

  it('hides source management from viewers', async () => {
    renderPage('u-demo-viewer', <KnowledgeSourcesPage />);
    await screen.findByText('Engineering handbook', undefined, { timeout: 4000 });
    await waitFor(() => expect(screen.queryByRole('switch')).toBeNull());
    expect(screen.queryByRole('button', { name: 'Add source' })).toBeNull();
  });
});
