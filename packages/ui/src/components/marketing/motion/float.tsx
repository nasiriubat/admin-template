'use client';

import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cn } from '../../../lib/utils';

export interface FloatProps extends HTMLAttributes<HTMLDivElement> {
  /** Vertical travel in px. */
  amplitude?: number;
  /** Seconds per loop. */
  duration?: number;
  /** Seconds before the loop starts (use to desynchronise siblings). */
  delay?: number;
  /** Degrees of rock at the loop extremes. */
  rotate?: number;
  /** Freeze the loop (WCAG 2.2.2: expose this from a user control for non-decorative content). */
  paused?: boolean;
}

/**
 * Looping floating wrapper (CSS keyframes, compositor-only). Static under reduced motion via
 * `motion-reduce:animate-none`. Wrap decorative art; for meaningful content provide `paused` control.
 */
export const Float = forwardRef<HTMLDivElement, FloatProps>(function Float(
  { amplitude = 12, duration = 6, delay = 0, rotate = 0, paused, className, style, children, ...rest },
  ref,
) {
  const vars = {
    '--float-amp': `${amplitude}px`,
    '--float-duration': `${duration}s`,
    '--float-delay': `${delay}s`,
    '--float-rotate': `${rotate}deg`,
    ...style,
  } as CSSProperties;
  return (
    <div
      ref={ref}
      className={cn('animate-float will-change-transform motion-reduce:animate-none', paused && '[animation-play-state:paused]', className)}
      style={vars}
      {...rest}
    >
      {children}
    </div>
  );
});
