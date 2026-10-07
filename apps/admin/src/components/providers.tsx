'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@nexus/auth';
import { AppProviders } from '@nexus/ui';
import { appConfig } from '../lib/app-config';
import { authAdapter } from '../lib/auth-adapter';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProviders defaultTheme={{ preset: appConfig.theme.preset, density: appConfig.theme.density, motion: appConfig.theme.motion, mode: appConfig.theme.mode }}>
      <AuthProvider adapter={authAdapter}>{children}</AuthProvider>
    </AppProviders>
  );
}
