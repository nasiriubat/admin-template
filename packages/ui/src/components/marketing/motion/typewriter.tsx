'use client';

import { useEffect, useState } from 'react';
import { cn } from '../../../lib/utils';
import { usePrefersReducedMotion } from './shared';

export interface TypewriterProps {
  /** One string, or several to type, hold and delete in turn. */
  text: string | string[];
  /** ms per character. */
  speed?: number;
  /** ms to hold a finished string before deleting. */
  hold?: number;
  /** Loop through the strings forever (default: only when multiple strings). */
  loop?: boolean;
  cursor?: boolean;
  className?: string;
}

/**
 * Types text out character by character. The complete text is always present for assistive tech
 * (sr-only) and shown statically under reduced motion and on the server.
 */
export function Typewriter({ text, speed = 55, hold = 1600, loop, cursor = true, className }: TypewriterProps) {
  const reduced = usePrefersReducedMotion();
  const list = Array.isArray(text) ? text : [text];
  const looping = loop ?? list.length > 1;
  const [armed, setArmed] = useState(false);
  const [n, setN] = useState(0);
  const [which, setWhich] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!reduced) setArmed(true);
  }, [reduced]);

  const current = list[which] ?? '';
  useEffect(() => {
    if (!armed || reduced) return;
    const done = !deleting && n >= current.length;
    if (done && !looping) return;
    const id = window.setTimeout(
      () => {
        if (done) setDeleting(true);
        else if (deleting && n === 0) {
          setDeleting(false);
          setWhich((w) => (w + 1) % list.length);
        } else setN((c) => c + (deleting ? -1 : 1));
      },
      done ? hold : deleting ? speed / 2 : speed,
    );
    return () => window.clearTimeout(id);
  }, [armed, reduced, n, deleting, current, looping, hold, speed, list.length]);

  const visible = armed && !reduced ? current.slice(0, n) : list[0];
  return (
    <span className={className}>
      <span className="sr-only">{list.join('. ')}</span>
      <span aria-hidden="true">
        {visible}
        {cursor && !reduced && <span className={cn('ml-0.5 inline-block h-[1em] w-0.5 translate-y-[0.15em] animate-twinkle bg-current')} />}
      </span>
    </span>
  );
}
