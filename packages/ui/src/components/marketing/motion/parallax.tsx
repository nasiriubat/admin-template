'use client';

import { m, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { usePrefersReducedMotion } from './shared';
import { toneBg, type Tone } from './tones';

export interface ParallaxProps {
  children?: ReactNode;
  className?: string;
  /** Total vertical travel in px across the element's pass through the viewport (negative = opposite direction). */
  offset?: number;
  /** [start, end] scale across the pass, e.g. [1, 1.12]. */
  scale?: [number, number];
}

/** Scroll-linked y/scale wrapper. Renders a plain static element under reduced motion. */
export function Parallax({ children, className, offset = 60, scale }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const s = useTransform(scrollYProgress, [0, 1], scale ?? [1, 1]);
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <m.div ref={ref} className={cn('will-change-transform', className)} style={{ y, scale: s }}>
      {children}
    </m.div>
  );
}

export interface ScrollProgressProps {
  className?: string;
  tone?: Tone;
  /** Bar thickness utility, default `h-1`. */
  heightClass?: string;
}

/** Fixed top-of-page reading progress bar. Decorative (aria-hidden); smoothing is dropped under reduced motion. */
export function ScrollProgress({ className, tone = 'primary', heightClass = 'h-1' }: ScrollProgressProps) {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  return (
    <m.div
      aria-hidden="true"
      data-testid="scroll-progress"
      className={cn('pointer-events-none fixed inset-x-0 top-0 z-50 origin-left', heightClass, toneBg[tone], className)}
      style={{ scaleX: reduced ? scrollYProgress : smooth }}
    />
  );
}
