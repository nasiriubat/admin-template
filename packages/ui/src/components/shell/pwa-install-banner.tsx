'use client';

import { useCallback, useEffect, useState } from 'react';
import { IconRenderer } from '../icons/icon-renderer';
import { Button } from '../ui/button';
import { BrandMark } from './brand-mark';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const VISITS_KEY = 'nexus_visit_count';
const DISMISSED_KEY = 'nexus_pwa_dismissed';
/** Don't nag on first contact (docs/PWA.md): offer installation after this many visits. */
const MIN_VISITS = 3;

/** Capture the install prompt and expose `install()` for explicit menu actions. */
export function usePwaInstall() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setEvent(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    setEvent(null);
  }, [event]);

  return { canInstall: event !== null, install };
}

export function PwaInstallBanner({ canInstall, onInstall }: { canInstall: boolean; onInstall: () => void }) {
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return;
      const visits = Number(localStorage.getItem(VISITS_KEY) ?? '0') + 1;
      localStorage.setItem(VISITS_KEY, String(visits));
      setEligible(visits >= MIN_VISITS);
    } catch {
      // Storage unavailable: never show.
    }
  }, []);

  if (!canInstall || !eligible) return null;

  const dismiss = () => {
    setEligible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {}
  };

  return (
    <aside
      aria-label="Install app"
      className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 rounded-card border border-border bg-surface-elevated p-4 shadow-popover md:inset-x-auto md:bottom-6 md:right-6 md:w-96"
    >
      <div className="flex items-start gap-3">
        <BrandMark className="size-9 text-sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text">Install this app</p>
          <p className="text-xs text-text-muted">Launch it from your home screen and keep working with spotty connections.</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={onInstall}>
              <IconRenderer name="Download" className="size-3.5" /> Install
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss" className="grid size-8 place-items-center rounded-md text-text-muted hover:bg-canvas hover:text-text">
          <IconRenderer name="X" className="size-4" />
        </button>
      </div>
    </aside>
  );
}
