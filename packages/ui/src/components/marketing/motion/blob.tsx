'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { cn } from '../../../lib/utils';
import { usePrefersReducedMotion } from './shared';
import { seeded } from './tones';
import { toneFill, type Tone } from './tones';

export interface BlobProps {
  tone?: Tone;
  /** Seed for the organic shape; same seed => same blob on server and client. */
  seed?: number;
  /** Seconds for one morph loop. */
  duration?: number;
  /** Fill opacity 0-1. */
  opacity?: number;
  /** Morph continuously (default). Static under reduced motion. */
  animated?: boolean;
  className?: string;
}

const POINTS = 8;

/** Smooth closed path through `POINTS` radial points (Catmull-Rom to cubic Bezier). */
function blobPath(rand: () => number) {
  const pts = Array.from({ length: POINTS }, (_, i) => {
    const a = (i / POINTS) * Math.PI * 2;
    const r = 62 + rand() * 30;
    return [100 + Math.cos(a) * r, 100 + Math.sin(a) * r] as const;
  });
  const at = (i: number) => pts[(i + POINTS) % POINTS]!;
  let d = `M${at(0)[0].toFixed(1)} ${at(0)[1].toFixed(1)}`;
  for (let i = 0; i < POINTS; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]!.toFixed(1)} ${c1[1]!.toFixed(1)} ${c2[0]!.toFixed(1)} ${c2[1]!.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

/** Organic SVG blob that slowly morphs between three seeded shapes. Decorative (aria-hidden). */
export function Blob({ tone = 'primary', seed = 7, duration = 14, opacity = 0.2, animated = true, className }: BlobProps) {
  const reduced = usePrefersReducedMotion();
  const shapes = useMemo(() => {
    const rand = seeded(seed);
    return [blobPath(rand), blobPath(rand), blobPath(rand)];
  }, [seed]);
  const morph = animated && !reduced;
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 200 200" className={cn('block', toneFill[tone], className)}>
      {morph ? (
        // `d` goes through initial/animate (not a prop) so framer-motion never renders an undefined path.
        <motion.path
          initial={{ d: shapes[0]! }}
          animate={{ d: [shapes[0]!, shapes[1]!, shapes[2]!, shapes[0]!] }}
          fillOpacity={opacity}
          transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        <path d={shapes[0]} fillOpacity={opacity} />
      )}
    </svg>
  );
}
