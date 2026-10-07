'use client';

import { useSyncExternalStore, type RefObject, useEffect, useState } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';

function subscribe(cb: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener?.('change', cb);
  return () => mq.removeEventListener?.('change', cb);
}

/**
 * Live `prefers-reduced-motion` flag. Returns `false` on the server so SSR markup is the fully
 * visible static layout; primitives only "arm" their animation after mount.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => (typeof window !== 'undefined' && !!window.matchMedia ? window.matchMedia(REDUCED).matches : false),
    () => false,
  );
}

/** True once mounted on the client (SSR and first paint stay static and visible). */
export function useMounted(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/** Whether the browser can observe intersections (false in jsdom => content stays static). */
export const canObserve = () => typeof IntersectionObserver !== 'undefined';

export type RevealPhase = 'static' | 'hidden' | 'shown';

/**
 * Drives in-view animation without ever hiding content on the server: phase starts `static`
 * (visible). Only after mount, with IntersectionObserver available and motion allowed, does an
 * off-screen element go `hidden`, then `shown` when it enters view. Reduced motion stays `static`.
 */
export function useRevealPhase(
  ref: RefObject<Element | null>,
  { once = true, amount = 0.2, rootMargin = '0px' }: { once?: boolean; amount?: number; rootMargin?: string } = {},
) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<RevealPhase>('static');
  useEffect(() => {
    const el = ref.current;
    if (reduced || !el || !canObserve()) {
      setPhase('static');
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setPhase('shown');
          if (once) io.disconnect();
        } else {
          setPhase((p) => (p === 'static' || !once ? 'hidden' : p));
        }
      },
      { threshold: amount, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, reduced, once, amount, rootMargin]);
  return { phase, reduced };
}

