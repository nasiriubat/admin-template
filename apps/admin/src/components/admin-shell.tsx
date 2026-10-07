'use client';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, type ReactNode } from 'react';
import { useAuth } from '@nexus/auth';
import { getRuntimeConfig, isModuleEnabled, matchRoute } from '@nexus/config';
import { allModules } from '@nexus/features';
import { isDemoMode, UNAUTHORIZED_EVENT } from '@nexus/features/_shared';
import { NotificationsMenu } from '@nexus/features/notifications';
import { AppShell, Badge, type AssistantAction, Skeleton, UnauthorizedState } from '@nexus/ui';
import { appConfig } from '../lib/app-config';
import { breadcrumbsFor, navigationFor } from '../lib/modules';

const { marketingUrl } = getRuntimeConfig();
const assistantActions: AssistantAction[] = [{ id: 'new-user', label: 'Invite user', icon: 'UserPlus', href: '/users' }, { id: 'workflows', label: 'Workflows', icon: 'Workflow', href: '/workflows' }];
const externalLinks = marketingUrl ? [{ label: 'Landing site', href: marketingUrl }] : undefined;

/** Full-page placeholder while the session is being resolved (prevents a flash of the sign-in redirect). */
function ShellSkeleton() {
  return (
    <div className="flex min-h-dvh bg-canvas" role="status" aria-label="Loading application">
      <div className="hidden w-64 shrink-0 border-r border-border bg-surface p-4 md:block">
        <Skeleton className="mb-6 h-10 w-40" />
        {Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="mb-3 h-9 w-full" />)}
      </div>
      <div className="flex-1">
        <div className="h-16 border-b border-border bg-surface" />
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { status, user, can, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginHref = useMemo(() => `/login${pathname && pathname !== '/' ? `?next=${encodeURIComponent(pathname)}` : ''}`, [pathname]);

  // Signed out (or session expired mid-use): go to the sign-in page, remembering where we were.
  useEffect(() => {
    if (status === 'unauthenticated') router.replace(loginHref);
  }, [status, router, loginHref]);

  // Never let one user's cached data (users, audit, sessions...) outlive their session.
  useEffect(() => {
    if (status === 'unauthenticated') queryClient.clear();
  }, [status, queryClient]);

  // Any API call that comes back 401 ends the session.
  useEffect(() => {
    const onUnauthorized = () => void signOut();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [signOut]);

  const navigation = useMemo(() => navigationFor(user?.permissions ?? []), [user]);

  if (status !== 'authenticated' || !user) return <ShellSkeleton />;

  const match = matchRoute(pathname, allModules);
  const moduleDisabled = match ? !isModuleEnabled(match.module, appConfig.modules) : false;
  const allowed = !match || can(match.route.permission);

  return (
    <AppShell
      navigation={navigation}
      resolveBreadcrumbs={breadcrumbsFor}
      appName={appConfig.name}
      appVersion={appConfig.version}
      user={{ name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl }}
      onSignOut={() => void signOut()}
      notifications={<NotificationsMenu />}
      externalLinks={externalLinks}
      assistant={{ enabledByDefault: appConfig.assistant.enabled, actions: assistantActions }}
      statusChip={isDemoMode ? <Badge variant="warning" dot>Demo data</Badge> : undefined}
    >
      {moduleDisabled ? (
        <UnauthorizedState size="page" title="This module is turned off" description="It has been disabled for this deployment." />
      ) : allowed ? (
        children
      ) : (
        <UnauthorizedState size="page" />
      )}
    </AppShell>
  );
}
