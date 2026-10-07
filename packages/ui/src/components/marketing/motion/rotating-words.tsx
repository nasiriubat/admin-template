'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '../../../lib/utils';
import { usePrefersReducedMotion } from './shared';

export interface RotatingWordsProps {
  words: string[];
  /** ms each word stays. */
  interval?: number;
  className?: string;
  /** Class for the rotating word itself (e.g. `text-primary`). */
  wordClassName?: string;
}

/**
 * Cycles through `words` inline. Screen readers get every word as sr-only text (comma separated);
 * the animated word is aria-hidden. Static first word under reduced motion; pauses on hover/focus.
 */
export function RotatingWords({ words, interval = 2400, className, wordClassName }: RotatingWordsProps) {
  const reduced = usePrefersReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');

  useEffect(() => {
    if (reduced || paused || words.length < 2) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [reduced, paused, words.length, interval]);

  return (
    <span
      className={cn('relative inline-grid align-baseline', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="sr-only">{words.join(', ')}</span>
      {/* Invisible widest word reserves space so surrounding text never jumps. */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-nowrap">
        {longest}
      </span>
      <span aria-hidden="true" className="col-start-1 row-start-1 overflow-hidden whitespace-nowrap">
        {reduced ? (
          <span className={wordClassName}>{words[0]}</span>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={words[i]}
              className={cn('inline-block', wordClassName)}
              initial={{ y: '60%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-60%', opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {words[i]}
            </motion.span>
          </AnimatePresence>
        )}
      </span>
    </span>
  );
}
