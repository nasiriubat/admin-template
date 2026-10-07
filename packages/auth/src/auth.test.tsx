import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { AuthProvider, useAuth } from './auth-provider';
import { createDemoAuthAdapter } from './demo-adapter';

const wrapper = (adapter = createDemoAuthAdapter()) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <AuthProvider adapter={adapter}>{children}</AuthProvider>;
  };

describe('AuthProvider with the demo adapter', () => {
  it('starts unauthenticated and rejects short passwords', async () => {
    document.cookie = 'nexus_session=; Max-Age=0; Path=/';
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));
    await expect(result.current.signIn({ email: 'admin@example.com', password: 'short' })).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('signs in, exposes permissions, and signs out', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));
    await act(async () => {
      await result.current.signIn({ email: 'viewer@example.com', password: 'longenough' });
    });
    expect(result.current.status).toBe('authenticated');
    expect(result.current.can('dashboard.view')).toBe(true);
    expect(result.current.can('users.manage')).toBe(false);
    await act(async () => result.current.signOut());
    expect(result.current.status).toBe('unauthenticated');
  });
});
