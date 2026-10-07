import { AuthError, SESSION_COOKIE, type AuthAdapter, type Credentials, type Session, type SessionUser } from './types';

/**
 * DEMO ONLY. Accepts the sample accounts below with any password of 8+ characters and keeps a
 * non-secret marker cookie so the edge middleware can redirect signed-out visitors. It provides
 * no real security; production deployments must supply an adapter backed by a real server.
 */
export const DEMO_USERS: Array<SessionUser & { password?: never }> = [
  {
    id: 'u-demo-admin',
    name: 'Avery Morgan',
    email: 'admin@example.com',
    role: 'Super Admin',
    permissions: ['*'],
  },
  {
    id: 'u-demo-editor',
    name: 'Jordan Lee',
    email: 'editor@example.com',
    role: 'Editor',
    permissions: [
      'dashboard.view',
      'analytics.view',
      'users.view',
      'audit.view',
      'logs.view',
      'jobs.view',
      'health.view',
      'files.*',
      'settings.view',
      'notifications.view',
    ],
  },
  {
    id: 'u-demo-viewer',
    name: 'Sam Rivera',
    email: 'viewer@example.com',
    role: 'Viewer',
    permissions: ['dashboard.view', 'analytics.view', 'health.view', 'notifications.view'],
  },
];

const SESSION_HOURS = 8;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

export function createDemoAuthAdapter(users = DEMO_USERS): AuthAdapter {
  return {
    async getSession(): Promise<Session | null> {
      const id = readCookie(SESSION_COOKIE);
      const user = users.find((u) => u.id === id);
      if (!user) return null;
      return { user, expiresAt: new Date(Date.now() + SESSION_HOURS * 3600_000).toISOString() };
    },

    async signIn({ email, password, remember }: Credentials): Promise<Session> {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || password.length < 8) {
        throw new AuthError('Email or password is incorrect.', 'INVALID_CREDENTIALS');
      }
      writeCookie(SESSION_COOKIE, user.id, remember ? 30 * 24 * 3600 : SESSION_HOURS * 3600);
      return { user, expiresAt: new Date(Date.now() + SESSION_HOURS * 3600_000).toISOString() };
    },

    async signOut() {
      writeCookie(SESSION_COOKIE, '', 0);
    },

    async requestPasswordReset() {
      // Intentionally identical for known and unknown addresses (no account enumeration).
      await new Promise((resolve) => setTimeout(resolve, 350));
    },
  };
}
