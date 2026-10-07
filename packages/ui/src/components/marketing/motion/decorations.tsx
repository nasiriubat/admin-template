'use client';

import { m } from 'framer-motion';
import { useMemo, useRef, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { useRevealPhase } from './shared';
import { seeded } from './tones';
import { toneFill, toneStroke, type Tone } from './tones';

export interface SquiggleProps {
  /** Text/content to underline. Omit to render a standalone divider squiggle. */
  children?: ReactNode;
  tone?: Tone;
  /** Draw the line on when scrolled into view. */
  animated?: boolean;
  className?: string;
}

const WAVE = 'M2 8 Q 12 0 22 8 T 42 8 T 62 8 T 82 8 T 102 8 T 122 8 T 142 8 T 162 8 T 182 8 T 198 8';

/** Hand-drawn style wavy line. Wrap a word to underline it, or use alone as a divider. Decorative SVG is aria-hidden. */
export function Squiggle({ children, tone = 'primary', animated = true, className }: SquiggleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const { phase } = useRevealPhase(ref, { amount: 0.6 });
  const svg = (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 200 16" preserveAspectRatio="none" className={cn('block h-3 w-full', children && 'absolute inset-x-0 -bottom-2')}>
      <m.path
        d={WAVE}
        fill="none"
        strokeWidth={3}
        strokeLinecap="round"
        className={toneStroke[tone]}
        initial={false}
        animate={{ pathLength: animated && phase === 'hidden' ? 0 : 1 }}
        transition={{ duration: animated && phase === 'hidden' ? 0 : 0.9, ease: 'easeOut' }}
      />
    </svg>
  );
  if (!children) return <span ref={ref} className={cn('block', className)}>{svg}</span>;
  return (
    <span ref={ref} className={cn('relative inline-block', className)}>
      {children}
      {svg}
    </span>
  );
}

const STAR = 'M12 0 C12.8 7 17 11.2 24 12 C17 12.8 12.8 17 12 24 C11.2 17 7 12.8 0 12 C7 11.2 11.2 7 12 0 Z';

export interface SparklesProps {
  count?: number;
  tone?: Tone;
  /** Sparkle size range in px. */
  size?: [number, number];
  seed?: number;
  /** Twinkle (default). Static under reduced motion. */
  animated?: boolean;
  /** Optional content the sparkles surround. */
  children?: ReactNode;
  className?: string;
}

/** Twinkling four-point sparkles scattered over a container (or around children). Decorative. */
export function Sparkles({ count = 6, tone = 'accent', size = [10, 22], seed = 3, animated = true, children, className }: SparklesProps) {
  const items = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, (_, i) => ({ x: r() * 100, y: r() * 100, s: size[0] + r() * (size[1] - size[0]), d: r() * 3, k: i }));
  }, [count, seed, size]);
  return (
    <span className={cn('relative inline-block', className)}>
      {children}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0" data-testid="sparkles">
        {items.map((it) => (
          <svg
            key={it.k}
            viewBox="0 0 24 24"
            focusable="false"
            className={cn('absolute -translate-x-1/2 -translate-y-1/2 motion-reduce:animate-none', toneFill[tone], animated && 'animate-twinkle')}
            style={{ left: `${it.x}%`, top: `${it.y}%`, width: it.s, height: it.s, animationDelay: `${it.d}s` }}
          >
            <path d={STAR} />
          </svg>
        ))}
      </span>
    </span>
  );
}
