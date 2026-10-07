'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { BreadcrumbCrumb } from '@nexus/config';

export interface ShellContextValue {
  setBreadcrumbs: (items: BreadcrumbCrumb[] | null) => void;
  openCommandPalette: () => void;
  openMobileMenu: () => void;
}

export const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error('useShell must be used inside <AppShell>');
  return ctx;
}

/**
 * Override the automatic breadcrumbs from a page, e.g. `/users/42` → Users › Avery Morgan.
 * Renders nothing; reverts to the automatic trail when unmounted.
 */
export function SetBreadcrumbs({ items }: { items: BreadcrumbCrumb[] }) {
  const { setBreadcrumbs } = useShell();
  const key = JSON.stringify(items);
  useEffect(() => {
    setBreadcrumbs(JSON.parse(key) as BreadcrumbCrumb[]);
    return () => setBreadcrumbs(null);
  }, [key, setBreadcrumbs]);
  return null;
}

export function ShellProvider({ value, children }: { value: ShellContextValue; children: ReactNode }) {
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}
