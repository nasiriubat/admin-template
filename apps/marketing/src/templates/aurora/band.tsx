import type { ReactNode } from 'react';
import { cn, toneBg, WaveDivider, type Tone, type WaveStyle } from '@nexus/ui/marketing';

export interface BandProps {
  id?: string;
  /** id of the heading that names this section. */
  labelledBy?: string;
  /** Background token of this section. */
  tone: Tone;
  /** Background token of the section that follows; the wave at the bottom is painted in it. */
  next: Tone;
  wave?: WaveStyle;
  flip?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * One Aurora page section: a token-coloured band whose bottom edge is a wave leading into the
 * next band, so no two sections ever meet at a hard rectangle.
 */
export function Band({ id, labelledBy, tone, next, wave = 'smooth', flip, className, children }: BandProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn('relative isolate overflow-x-clip', toneBg[tone], className)}>
      {children}
      <WaveDivider fill={next} variant={wave} flip={flip} className="-mb-px" />
    </section>
  );
}
