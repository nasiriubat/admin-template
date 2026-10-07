'use client';

import { hasPermission, type PermissionId } from '@nexus/config';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthAdapter, Credentials, Session, SessionUser } from './types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  status: AuthStatus;
  user: SessionUser | null;
  signIn: (credentials: Credentials) => Promise<Session>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  /** UX-level permission check. The backend remains the authority. */
  can: (permission?: PermissionId) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ adapter, children }: { adapter: AuthAdapter; children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    adapter
      .getSession()
      .then((session) => {
        if (cancelled) return;
        setUser(session?.user ?? null);
        setStatus(session ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setStatus('unauthenticated');
      });
    return () => {
      cancelled = true;
    };
  }, [adapter]);

  const signIn = useCallback(
    async (credentials: Credentials) => {
      const session = await adapter.signIn(credentials);
      setUser(session.user);
      setStatus('authenticated');
      return session;
    },
    [adapter],
  );

  const signOut = useCallback(async () => {
    try {
      await adapter.signOut();
    } finally {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, [adapter]);

  const can = useCallback(
    (permission?: PermissionId) => hasPermission(user?.permissions ?? [], permission),
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signOut, requestPasswordReset: (email) => adapter.requestPasswordReset(email), can }),
    [status, user, signIn, signOut, adapter, can],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function useCan(permission?: PermissionId): boolean {
  return useAuth().can(permission);
}
