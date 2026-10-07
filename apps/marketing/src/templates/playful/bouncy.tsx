'use client';

import { motion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { useRevealPhase } from '@nexus/ui/marketing';

const tags = { div: motion.div, li: motion.li } as const;

/**
 * Spring entrance on scroll. Like `Reveal`, content is fully visible on the server and under
 * reduced motion; it only starts hidden after mount, then pops in with an overshoot.
 */
export function BouncyReveal({ children, className, delay = 0, as = 'div', tilt = -3 }: { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'li'; tilt?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { phase } = useRevealPhase(ref, { amount: 0.15 });
  const Tag = tags[as];
  const hidden = phase === 'hidden';
  return (
    <Tag
      ref={ref as never}
      className={className}
      initial={false}
      animate={hidden ? { opacity: 0, y: 48, scale: 0.88, rotate: tilt } : { opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={hidden ? { duration: 0 } : { type: 'spring', stiffness: 240, damping: 13, mass: 0.9, delay }}
    >
      {children}
    </Tag>
  );
}
