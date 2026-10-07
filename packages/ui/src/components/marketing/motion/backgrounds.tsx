import type { CSSProperties } from 'react';
import { cn } from '../../../lib/utils';
import { toneBg, tokenColor, type Tone } from './tones';

const layer = 'pointer-events-none absolute inset-0 overflow-hidden';
const intensityAlpha = { subtle: 0.12, medium: 0.22, vivid: 0.35 } as const;
export type Intensity = keyof typeof intensityAlpha;

export interface BackdropProps {
  tones?: Tone[];
  intensity?: Intensity;
  /** Drift continuously (default). Always static under reduced motion (CSS `motion-reduce`). */
  animated?: boolean;
  className?: string;
}

const orbSpots = [
  'left-[-10%] top-[-20%] size-[28rem] animate-orb-a',
  'right-[-8%] top-[10%] size-[24rem] animate-orb-b',
  'left-[25%] bottom-[-25%] size-[30rem] animate-orb-a [animation-delay:-6s]',
  'right-[20%] bottom-[-10%] size-[18rem] animate-orb-b [animation-delay:-9s]',
];

/** Absolutely-positioned blurred colour orbs. Put inside a `relative overflow-hidden` section, behind content. */
export function Orbs({ tones = ['primary', 'accent', 'info'], intensity = 'medium', animated = true, className }: BackdropProps) {
  return (
    <div aria-hidden="true" className={cn(layer, className)} data-testid="orbs">
      {orbSpots.map((spot, i) => {
        const tone = tones[i % tones.length]!;
        return (
          <span
            key={i}
            className={cn('absolute rounded-full blur-3xl motion-reduce:animate-none', toneBg[tone], spot, !animated && 'animate-none')}
            style={{ opacity: intensityAlpha[intensity] }}
          />
        );
      })}
    </div>
  );
}

/** Layered radial-gradient mesh using token colours that slowly shifts. Behind content, `aria-hidden`. */
export function GradientMesh({ tones = ['primary', 'accent', 'info'], intensity = 'medium', animated = true, className }: BackdropProps) {
  const a = intensityAlpha[intensity];
  const [t0, t1, t2] = [tones[0] ?? 'primary', tones[1] ?? tones[0] ?? 'accent', tones[2] ?? tones[0] ?? 'info'];
  const style: CSSProperties = {
    backgroundImage: [
      `radial-gradient(at 15% 20%, ${tokenColor(t0, a)} 0, transparent 50%)`,
      `radial-gradient(at 85% 15%, ${tokenColor(t1, a)} 0, transparent 50%)`,
      `radial-gradient(at 55% 90%, ${tokenColor(t2, a)} 0, transparent 55%)`,
    ].join(','),
    backgroundSize: '160% 160%',
  };
  return <div aria-hidden="true" className={cn(layer, animated && 'animate-gradient-shift motion-reduce:animate-none', className)} style={style} data-testid="gradient-mesh" />;
}

export interface PatternProps {
  /** Cell size in px. */
  size?: number;
  /** Fade the pattern out toward the edges. */
  fade?: boolean;
  className?: string;
}

const radialFade = 'radial-gradient(ellipse at center, rgb(0 0 0) 30%, transparent 75%)';

/** Hairline grid background (token border colour). */
export function GridBackground({ size = 48, fade = true, className }: PatternProps) {
  const line = tokenColor('border', 0.7);
  const style: CSSProperties = {
    backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
    backgroundSize: `${size}px ${size}px`,
    ...(fade ? { maskImage: radialFade, WebkitMaskImage: radialFade } : null),
  };
  return <div aria-hidden="true" className={cn(layer, className)} style={style} data-testid="grid-background" />;
}

/** Dot-matrix background (token muted text colour). */
export function DotPattern({ size = 24, fade = true, className }: PatternProps) {
  const dot = tokenColor('muted', 0.35);
  const style: CSSProperties = {
    backgroundImage: `radial-gradient(${dot} 1.2px, transparent 1.2px)`,
    backgroundSize: `${size}px ${size}px`,
    ...(fade ? { maskImage: radialFade, WebkitMaskImage: radialFade } : null),
  };
  return <div aria-hidden="true" className={cn(layer, className)} style={style} data-testid="dot-pattern" />;
}
