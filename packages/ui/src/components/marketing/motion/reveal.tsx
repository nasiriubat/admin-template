'use client';

import { m, type Variants } from 'framer-motion';
import { Children, forwardRef, useImperativeHandle, useRef, type CSSProperties, type ReactNode } from 'react';
import { useRevealPhase } from './shared';

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';
export type RevealVariant = 'fade' | 'slide' | 'scale' | 'blur';
type Tag = 'div' | 'section' | 'article' | 'li' | 'span' | 'ul' | 'header' | 'p';

export interface RevealProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Entrance style. `slide` moves along `direction`; others combine with it when direction is not `none`. */
  variant?: RevealVariant;
  direction?: RevealDirection;
  /** Slide distance in px. */
  distance?: number;
  /** Seconds. */
  delay?: number;
  duration?: number;
  /** Animate only the first time it enters view (default true). */
  once?: boolean;
  /** Fraction of the element that must be visible (0-1). */
  amount?: number;
  as?: Tag;
}

function hiddenState(variant: RevealVariant, direction: RevealDirection, distance: number) {
  const move = variant === 'slide' || variant === 'fade' ? distance : 0;
  const o: Record<string, number | string> = { opacity: 0 };
  if (direction === 'up') o.y = move;
  if (direction === 'down') o.y = -move;
  if (direction === 'left') o.x = move;
  if (direction === 'right') o.x = -move;
  if (variant === 'scale') o.scale = 0.92;
  if (variant === 'blur') o.filter = 'blur(10px)';
  return o;
}

/**
 * Fades/slides/scales/blurs its children in when scrolled into view. Server HTML and
 * reduced-motion users get the final, fully visible state - content never depends on the animation.
 */
export const Reveal = forwardRef<HTMLElement, RevealProps>(function Reveal(
  { children, className, style, variant = 'slide', direction = 'up', distance = 24, delay = 0, duration = 0.6, once = true, amount = 0.2, as = 'div' },
  forwardedRef,
) {
  const ref = useRef<HTMLElement>(null);
  useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);
  const { phase } = useRevealPhase(ref, { once, amount });
  const MotionTag = m[as] as typeof m.div;
  const shown: Record<string, number | string> = { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' };
  const variants: Variants = {
    hidden: { ...hiddenState(variant, direction, distance), transition: { duration: 0 } },
    shown: { ...shown, transition: { duration, delay, ease: [0.16, 1, 0.3, 1] } },
  };
  return (
    <MotionTag
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      style={style}
      variants={variants}
      initial={false}
      animate={phase === 'hidden' ? 'hidden' : 'shown'}
    >
      {children}
    </MotionTag>
  );
});

export interface RevealGroupProps extends Omit<RevealProps, 'delay' | 'as'> {
  /** Seconds between each child's entrance. */
  stagger?: number;
  /** Delay before the first child. */
  delay?: number;
  /** Wrapper element. */
  as?: 'div' | 'ul' | 'ol' | 'section';
  /** Class applied to each child wrapper (e.g. grid item sizing). */
  itemClassName?: string;
  /** Element used for each child wrapper; use `li` when the group is a list. */
  itemAs?: Tag;
}

/** Reveals each child in sequence. Keep the group as the layout container (grid/flex via `className`). */
export function RevealGroup({ children, className, style, stagger = 0.08, delay = 0, as = 'div', itemClassName, itemAs = 'div', ...rest }: RevealGroupProps) {
  const Wrapper = as;
  return (
    <Wrapper className={className} style={style}>
      {Children.toArray(children).map((child, i) => (
        <Reveal key={i} as={itemAs} className={itemClassName} delay={delay + i * stagger} {...rest}>
          {child}
        </Reveal>
      ))}
    </Wrapper>
  );
}

/** Alias of {@link RevealGroup}. */
export const Stagger = RevealGroup;
