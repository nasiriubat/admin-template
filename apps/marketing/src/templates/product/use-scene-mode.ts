'use client';

import { useSyncExternalStore } from 'react';
import { usePrefersReducedMotion } from '@nexus/ui/marketing';

const DESKTOP = '(min-width: 1024px)';

function subscribe(cb: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener?.('change', cb);
  return () => mq.removeEventListener?.('change', cb);
}

/** True on viewports at least 1024px wide. False on the server so first paint is the static layout. */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, () => (typeof window !== 'undefined' && !!window.matchMedia ? window.matchMedia(DESKTOP).matches : false), () => false);
}

/**
 * Whether pinned, scroll-linked scenes may run: wide screens with motion allowed. Everywhere else
 * (phones, tablets, reduced motion, server render) scenes render as a plain, fully readable stack.
 */
export function useScrollScene(): boolean {
  const reduced = usePrefersReducedMotion();
  const desktop = useIsDesktop();
  return desktop && !reduced;
}
