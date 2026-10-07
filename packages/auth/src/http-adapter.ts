import { AuthError, type AuthAdapter, type Credentials, type Session } from './types';

export interface HttpAuthAdapterOptions {
  /** Backend origin, e.g. https://api.example.com (no trailing slash). */
  baseUrl: string;
  /** Override the endpoint paths if your backend differs from docs/API_CONTRACT.md. */
  paths?: Partial<Record<'session' | 'login' | 'logout' | 'forgotPassword', string>>;
  /** Extra headers, e.g. a CSRF token. */
  getHeaders?: () => Record<string, string>;
}

/**
 * Cookie-session adapter for backends following docs/API_CONTRACT.md. The server sets and clears
 * an HttpOnly session cookie; this adapter only sends credentials and reads `/auth/session`.
 * Cookie auth requires CSRF protection on the server: state-changing calls send
 * `X-Requested-With` so the backend can reject cross-site form posts.
 */
export function createHttpAuthAdapter({ baseUrl, paths = {}, getHeaders }: HttpAuthAdapterOptions): AuthAdapter {
  const p = { session: '/auth/session', login: '/auth/login', logout: '/auth/logout', forgotPassword: '/auth/forgot-password', ...paths };

  async function call(path: string, init: RequestInit & { json?: unknown } = {}) {
    try {
      return await fetch(`${baseUrl}${path}`, {
        ...init,
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(init.json !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...getHeaders?.(),
        },
        body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
      });
    } catch {
      throw new AuthError('Network error. Check your connection and try again.', 'NETWORK_ERROR');
    }
  }

  const readSession = async (res: Response): Promise<Session> => {
    const body = (await res.json()) as { data?: Session };
    if (!body.data?.user) throw new AuthError('Unexpected response from the server.');
    return body.data;
  };

  return {
    async getSession() {
      const res = await call(p.session);
      if (res.status === 401 || res.status === 403) return null;
      if (!res.ok) throw new AuthError('Could not load your session.');
      return readSession(res);
    },
    async signIn(credentials: Credentials) {
      const res = await call(p.login, { method: 'POST', json: credentials });
      if (res.status === 401 || res.status === 422 || res.status === 400) {
        throw new AuthError('Email or password is incorrect.', 'INVALID_CREDENTIALS');
      }
      if (!res.ok) throw new AuthError('Sign in failed. Please try again.');
      return readSession(res);
    },
    async signOut() {
      await call(p.logout, { method: 'POST' });
    },
    async requestPasswordReset(email: string) {
      // The response is deliberately ignored so the UI cannot be used to enumerate accounts.
      await call(p.forgotPassword, { method: 'POST', json: { email } });
    },
  };
}
