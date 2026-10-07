'use client';

import { m, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, type HTMLAttributes, type PointerEvent, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { usePrefersReducedMotion } from './shared';

export interface TiltCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  /** Maximum tilt in degrees. */
  maxTilt?: number;
  /** Hover scale. */
  scale?: number;
  children?: ReactNode;
}

/** 3D tilt following a mouse/pen pointer. Disabled for touch and reduced motion (renders a plain div). */
export function TiltCard({ maxTilt = 8, scale = 1.02, className, children, ...rest }: TiltCardProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 22 };
  const rx = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), spring);
  const ry = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), spring);
  const s = useSpring(1, spring);
  if (reduced) return <div className={className} {...rest}>{children}</div>;
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    s.set(scale);
  };
  const leave = () => {
    px.set(0.5);
    py.set(0.5);
    s.set(1);
  };
  return (
    <m.div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn('will-change-transform', className)}
      style={{ rotateX: rx, rotateY: ry, scale: s, transformPerspective: 900, transformStyle: 'preserve-3d' }}
      {...rest}
    >
      {children}
    </m.div>
  );
}

export interface MagneticButtonProps {
  /** The real interactive element (Button, link). Stays focusable and keeps its semantics. */
  children: ReactNode;
  /** 0-1 fraction of pointer offset the wrapper follows. */
  strength?: number;
  className?: string;
}

/** Wrapper that nudges its child toward a nearby mouse pointer. No effect for touch, keyboard or reduced motion. */
export function MagneticButton({ children, strength = 0.3, className }: MagneticButtonProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 });
  if (reduced) return <span className={cn('inline-block', className)}>{children}</span>;
  const move = (e: PointerEvent<HTMLSpanElement>) => {
    if (e.pointerType === 'touch' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <m.span ref={ref} onPointerMove={move} onPointerLeave={reset} className={cn('inline-block', className)} style={{ x, y }}>
      {children}
    </m.span>
  );
}
