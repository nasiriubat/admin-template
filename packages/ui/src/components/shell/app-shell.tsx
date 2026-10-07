'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { pickMobileItems, type BreadcrumbCrumb, type NavGroupConfig } from '@nexus/config';
import { Breadcrumbs } from './breadcrumbs';
import { CommandPalette, type PaletteAction } from './command-palette';
import { MobileBottomNav } from './mobile-bottom-nav';
import { MobileNavSheet } from './mobile-nav-sheet';
import { OfflineBanner } from './offline-banner';
import { PwaInstallBanner, usePwaInstall } from './pwa-install-banner';
import { ShellProvider } from './shell-context';
import { Sidebar } from './sidebar';
import { TopBar, type ShellUser } from './top-bar';

export interface AppShellProps {
  children: ReactNode;
  navigation: NavGroupConfig[];
  /** Resolve breadcrumbs for the current path when a page has not set its own. */
  resolveBreadcrumbs: (pathname: string) => BreadcrumbCrumb[];
  appName: string;
  appVersion?: string;
  user?: ShellUser | null;
  onSignOut?: () => void;
  notifications?: ReactNode;
  statusChip?: ReactNode;
  paletteActions?: PaletteAction[];
}

const COLLAPSED_KEY = 'nexus_sidebar_collapsed';
const PINNED_KEY = 'nexus_sidebar_pinned';

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
}

/**
 * Persistent application frame: sidebar (desktop), top bar, breadcrumb row, content canvas,
 * bottom navigation + drawer (mobile). Mount it once in a layout so it never remounts on navigation.
 */
export function AppShell({ children, navigation, resolveBreadcrumbs, appName, appVersion, user, onSignOut, notifications, statusChip, paletteActions }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [override, setOverride] = useState<BreadcrumbCrumb[] | null>(null);
  const { canInstall, install } = usePwaInstall();

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === 'true');
      setPinned(localStorage.getItem(PINNED_KEY) !== 'false');
    } catch {
      // Storage unavailable: defaults.
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, String(!prev));
      } catch {}
      return !prev;
    });
  }, []);

  const togglePinned = useCallback(() => {
    setPinned((prev) => {
      try {
        localStorage.setItem(PINNED_KEY, String(!prev));
      } catch {}
      return !prev;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      } else if (key === 'b' && !isTypingTarget(e.target)) {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleCollapsed]);

  const crumbs = useMemo(() => override ?? resolveBreadcrumbs(pathname), [override, resolveBreadcrumbs, pathname]);
  const mobileItems = useMemo(() => pickMobileItems(navigation), [navigation]);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const shell = useMemo(() => ({ setBreadcrumbs: setOverride, openCommandPalette: openPalette, openMobileMenu: openMenu }), [openPalette, openMenu]);

  return (
    <ShellProvider value={shell}>
      <div className="flex min-h-dvh flex-col bg-canvas font-sans text-text">
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Skip to main content
        </a>
        <OfflineBanner />
        <div className="flex flex-1">
          <Sidebar groups={navigation} appName={appName} appVersion={appVersion} isCollapsed={collapsed} onToggleCollapse={toggleCollapsed} isPinned={pinned} onTogglePin={togglePinned} />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar appName={appName} user={user} onOpenSearch={openPalette} onSignOut={onSignOut} notifications={notifications} statusChip={statusChip} onInstallApp={canInstall ? install : undefined} />
            <Breadcrumbs items={crumbs} />
            <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] outline-none md:px-6 md:py-6 md:pb-10 lg:px-8">
              {children}
            </main>
          </div>
        </div>

        <MobileBottomNav items={mobileItems} onOpenMenu={openMenu} menuOpen={menuOpen} />
        <MobileNavSheet open={menuOpen} onOpenChange={setMenuOpen} groups={navigation} appName={appName} user={user} onSignOut={onSignOut} />
        <PwaInstallBanner canInstall={canInstall} onInstall={install} />
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} groups={navigation} actions={paletteActions} onSignOut={onSignOut} />
      </div>
    </ShellProvider>
  );
}
