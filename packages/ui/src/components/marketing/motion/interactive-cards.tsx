'use client';

import { forwardRef, useRef, type CSSProperties, type HTMLAttributes, type PointerEvent } from 'react';
import { cn } from '../../../lib/utils';
import { usePrefersReducedMotion } from './shared';
import { tokenColor, type Tone } from './tones';

export interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Token colour of the glow. */
  tone?: Tone;
  /** Glow radius in px. */
  radius?: number;
}

/**
 * Card whose border/surface is lit by a soft glow that follows the pointer (CSS variables, no re-render).
 * Glow only appears for hover-capable pointers and is not tracked under reduced motion.
 */
export const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(function SpotlightCard(
  { tone = 'primary', radius = 320, className, children, onPointerMove, ...rest },
  forwardedRef,
) {
  const local = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const move = (e: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    const el = local.current;
    if (!el || reduced || e.pointerType === 'touch') return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  const glow = `radial-gradient(${radius}px circle at var(--mx, 50%) var(--my, 50%), ${tokenColor(tone, 0.16)}, transparent 70%)`;
  return (
    <div
      ref={(n) => {
        local.current = n;
        if (typeof forwardedRef === 'function') forwardedRef(n);
        else if (forwardedRef) forwardedRef.current = n;
      }}
      onPointerMove={move}
      className={cn('group relative overflow-hidden rounded-card border border-border bg-surface', className)}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 motion-reduce:hidden [@media(hover:hover)]:group-hover:opacity-100"
        style={{ backgroundImage: glow }}
      />
      <div className="relative">{children}</div>
    </div>
  );
});

export interface GlowBorderProps extends HTMLAttributes<HTMLDivElement> {
  /** Token colours of the rotating gradient. */
  tones?: Tone[];
  /** Border thickness in px. */
  thickness?: number;
  /** Freeze the rotation. */
  paused?: boolean;
  /** Class for the inner surface. */
  innerClassName?: string;
}

/** Container with an animated conic-gradient border. Static gradient under reduced motion. */
export const GlowBorder = forwardRef<HTMLDivElement, GlowBorderProps>(function GlowBorder(
  { tones = ['primary', 'accent', 'info'], thickness = 1.5, paused, className, innerClassName, children, ...rest },
  ref,
) {
  const stops = [...tones, tones[0] ?? 'primary'].map((t, i, a) => `${tokenColor(t, 0.95)} ${Math.round((i / (a.length - 1)) * 100)}%`).join(', ');
  const spin: CSSProperties = { backgroundImage: `conic-gradient(from 0deg, ${stops})` };
  return (
    <div ref={ref} className={cn('relative overflow-hidden rounded-card', className)} style={{ padding: thickness }} {...rest}>
      <span aria-hidden="true" className="pointer-events-none absolute inset-[-100%]">
        <span className={cn('absolute inset-0 animate-spin-slow motion-reduce:animate-none', paused && '[animation-play-state:paused]')} style={spin} />
      </span>
      <div className={cn('relative h-full rounded-[calc(var(--radius-card)-2px)] bg-surface', innerClassName)}>{children}</div>
    </div>
  );
});
