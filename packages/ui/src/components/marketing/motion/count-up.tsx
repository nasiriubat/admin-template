'use client';

import { animate } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { cn } from '../../../lib/utils';
import { canObserve, usePrefersReducedMotion } from './shared';

export interface CountUpProps {
  /** Final value. */
  value: number;
  from?: number;
  /** Seconds. */
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** BCP-47 locale for digit grouping; undefined uses the runtime default. */
  locale?: string;
  className?: string;
}

/**
 * Counts up when scrolled into view. The final formatted value is always in the DOM (SSR, assistive
 * tech, reduced motion); the animated copy is aria-hidden and writes to the DOM directly (no re-renders).
 */
export function CountUp({ value, from = 0, duration = 1.6, decimals = 0, prefix = '', suffix = '', locale, className }: CountUpProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }), [locale, decimals]);
  const text = (n: number) => `${prefix}${fmt.format(n)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !canObserve()) return;
    let controls: { stop: () => void } | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          io.disconnect();
          controls = animate(from, value, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (n) => (el.textContent = text(n)), onComplete: () => (el.textContent = text(value)) });
        } else {
          el.textContent = text(from);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      controls?.stop();
      el.textContent = text(value);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, from, duration, reduced, fmt, prefix, suffix]);

  return (
    <span className={cn('tabular-nums', className)}>
      <span ref={ref} aria-hidden="true">
        {text(value)}
      </span>
      <span className="sr-only">{text(value)}</span>
    </span>
  );
}
