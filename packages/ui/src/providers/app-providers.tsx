'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ThemeProvider, type ThemeConfig } from '@nexus/theme';
import { Toaster } from '../components/ui/toaster';
import { TooltipProvider } from '../components/ui/tooltip';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Do not hammer the server on auth/permission/validation failures.
        retry: (failureCount, error) => {
          const status = (error as { status?: number } | null)?.status ?? 0;
          if (status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}

/**
 * Providers every Nexus admin app needs: theme, server-state
 * cache, tooltips and the toast host. Auth is added by the app (it owns the adapter).
 */
export function AppProviders({ children, defaultTheme }: { children: ReactNode; defaultTheme?: Partial<ThemeConfig> }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <ThemeProvider defaultConfig={defaultTheme}>
      {/* The admin animates with CSS only (honouring prefers-reduced-motion in base.css), so framer-motion stays out of its bundle. */}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
