import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider, createDemoAuthAdapter } from '@nexus/auth';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/feature-flags' }));

import { FeatureFlagsPage } from './feature-flags-page';

describe('FeatureFlagsPage', () => {
  it('loads flags and renders per-environment switches', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <AuthProvider adapter={createDemoAuthAdapter()}>
          <FeatureFlagsPage />
        </AuthProvider>
      </QueryClientProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Feature Flags' })).toBeTruthy();
    await waitFor(() => expect(screen.getAllByText('new-checkout-flow').length).toBeGreaterThan(0), { timeout: 4000 });
    expect(screen.getAllByRole('switch', { name: /new-checkout-flow in Production/ }).length).toBeGreaterThan(0);
  });
});
