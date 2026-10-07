'use client';

import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { usePrefersReducedMotion } from './shared';

export interface MarqueeProps {
  children: ReactNode;
  /** Accessible name for the group (e.g. "Trusted by"). */
  label?: string;
  direction?: 'left' | 'right';
  /** Scroll speed in px per second. */
  speed?: number;
  /** Space between items, px. */
  gap?: number;
  pauseOnHover?: boolean;
  /** Show a visible pause/play button (WCAG 2.2.2). Default true. */
  pauseButton?: boolean;
  /** Fade the edges with a mask. */
  fade?: boolean;
  className?: string;
  itemClassName?: string;
}

/**
 * Infinite ticker. The second copy of the content is `aria-hidden` + `inert`. Pauses on
 * hover/focus and via a visible button. Under reduced motion it becomes a static, wrapped list.
 */
export function Marquee({
  children,
  label,
  direction = 'left',
  speed = 40,
  gap = 48,
  pauseOnHover = true,
  pauseButton = true,
  fade = true,
  className,
  itemClassName,
}: MarqueeProps) {
  const reduced = usePrefersReducedMotion();
  const items = Children.toArray(children);
  const trackRef = useRef<HTMLUListElement>(null);
  const [duration, setDuration] = useState(30);
  const [userPaused, setUserPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    const w = trackRef.current?.scrollWidth;
    if (w && speed > 0) setDuration(Math.max(8, w / speed));
  }, [speed, gap, items.length, reduced]);

  const list = (hidden: boolean) => (
    <ul
      ref={hidden ? undefined : trackRef}
      aria-hidden={hidden || undefined}
      inert={hidden}
      className="flex shrink-0 items-center"
      style={{ gap, paddingRight: gap }}
    >
      {items.map((child, i) => (
        <li key={i} className={cn('shrink-0', itemClassName)}>
          {child}
        </li>
      ))}
    </ul>
  );

  if (reduced) {
    return (
      <div role="group" aria-label={label} className={className}>
        <ul className="flex flex-wrap items-center justify-center" style={{ gap }}>
          {items.map((child, i) => (
            <li key={i} className={itemClassName}>
              {child}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const paused = userPaused || (pauseOnHover && hover) || focus;
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('relative', className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    >
      <div className={cn('overflow-hidden', fade && '[mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]')}>
        <div
          data-testid="marquee-track"
          className={cn('flex w-max motion-reduce:animate-none', direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse')}
          style={{ '--marquee-duration': `${duration}s`, animationPlayState: paused ? 'paused' : 'running' } as CSSProperties}
        >
          {list(false)}
          {list(true)}
        </div>
      </div>
      {pauseButton && (
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          aria-label={userPaused ? 'Play scrolling content' : 'Pause scrolling content'}
          className="mx-auto mt-3 flex size-9 items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-colors hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {userPaused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
