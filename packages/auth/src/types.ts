import type { PermissionId } from '@nexus/config';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  /** Display name of the role, e.g. "Super Admin". */
  role: string;
  permissions: PermissionId[];
  avatarUrl?: string;
}

export interface Session {
  user: SessionUser;
  /** ISO timestamp; the UI signs out when it passes. */
  expiresAt?: string;
}

export interface Credentials {
  email: string;
  password: string;
  remember?: boolean;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID_CREDENTIALS' | 'NETWORK_ERROR' | 'UNKNOWN' = 'UNKNOWN',
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Backend-agnostic auth contract (docs/API_CONTRACT.md). Implement it for cookie sessions or
 * bearer tokens; the UI never inspects how the session is stored.
 */
export interface AuthAdapter {
  getSession(): Promise<Session | null>;
  signIn(credentials: Credentials): Promise<Session>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
}

/** Name of the cookie the edge middleware checks to decide whether to redirect to /login. */
export const SESSION_COOKIE = 'nexus_session';
