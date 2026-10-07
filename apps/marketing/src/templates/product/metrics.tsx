'use client';

import { m, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';
import { CountUp, CurvedSection, usePrefersReducedMotion } from '@nexus/ui/marketing';
import { metrics } from '../../content/product';
import { windowProgress, ease } from './scroll-math';

function Bar({ progress, fraction, reduced }: { progress: MotionValue<number>; fraction: number; reduced: boolean }) {
  const scaleX = useTransform(progress, (p) => ease(windowProgress(p, 0.15, 0.6)) * fraction);
  return (
    <div aria-hidden="true" className="mt-5 h-1.5 overflow-hidden rounded-full bg-primary-foreground/25">
      <m.div style={reduced ? { scaleX: fraction } : { scaleX }} className="h-full origin-left rounded-full bg-primary-foreground" />
    </div>
  );
}

/** Large numbers that count up on entry while a bar under each fills with scroll. */
export function Metrics() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end center'] });
  return (
    <CurvedSection tone="primary" curve="both" className="text-primary-foreground">
      <div ref={ref} className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <h2 className="mx-auto max-w-2xl text-center text-3xl font-semibold tracking-tight md:text-5xl">Numbers that hold up</h2>
        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label}>
              <dd className="text-5xl font-semibold tracking-tight md:text-6xl">
                <CountUp value={m.value} suffix={m.suffix} decimals={m.decimals ?? 0} />
              </dd>
              <dt className="mt-2 text-sm opacity-90 md:text-base">{m.label}</dt>
              <Bar progress={scrollYProgress} fraction={m.fraction} reduced={reduced} />
            </div>
          ))}
        </dl>
      </div>
    </CurvedSection>
  );
}
