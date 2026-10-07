import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { toneBg, toneFill, type Tone } from './tones';

export interface CurvedSectionProps {
  children?: ReactNode;
  id?: string;
  /** Which edges are curved. */
  curve?: 'top' | 'bottom' | 'both';
  /** Token colour of this section. */
  tone?: Tone;
  /** Token colour of the neighbouring page area visible in the curve corners (usually 'canvas'). */
  outerTone?: Tone;
  /** Curve depth utilities (height of the edge mask). */
  depthClass?: string;
  className?: string;
  /** Class for the content wrapper (padding/layout). */
  contentClassName?: string;
  as?: 'section' | 'div' | 'footer';
}

function Edge({ at, outer, depthClass }: { at: 'top' | 'bottom'; outer: Tone; depthClass: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className={cn('pointer-events-none absolute inset-x-0 block w-full', depthClass, toneFill[outer], at === 'top' ? '-top-px' : '-bottom-px rotate-180')}
    >
      <path d="M0 0 H1440 V80 Q720 -80 0 80 Z" />
    </svg>
  );
}

/** Section wrapper with a domed top and/or bottom edge, drawn as token-coloured SVG masks over the section. */
export function CurvedSection({ children, id, curve = 'both', tone = 'surface', outerTone = 'canvas', depthClass = 'h-8 md:h-16', className, contentClassName, as: Tag = 'section' }: CurvedSectionProps) {
  const top = curve === 'top' || curve === 'both';
  const bottom = curve === 'bottom' || curve === 'both';
  return (
    <Tag id={id} className={cn('relative isolate overflow-hidden', toneBg[tone], className)}>
      {top && <Edge at="top" outer={outerTone} depthClass={depthClass} />}
      <div className={cn('relative', top && 'pt-12 md:pt-20', bottom && 'pb-12 md:pb-20', contentClassName)}>{children}</div>
      {bottom && <Edge at="bottom" outer={outerTone} depthClass={depthClass} />}
    </Tag>
  );
}
