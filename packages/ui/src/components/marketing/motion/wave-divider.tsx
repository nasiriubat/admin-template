import { cn } from '../../../lib/utils';
import { toneFill, type Tone } from './tones';

export type WaveStyle = 'smooth' | 'layered' | 'curve' | 'tilt' | 'zigzag';

export interface WaveDividerProps {
  /** Wave shape. */
  variant?: WaveStyle;
  /** Which edge of the section it decorates: `bottom` (default) sits at the section's end, `top` at its start. */
  position?: 'top' | 'bottom';
  /** Mirror horizontally. */
  flip?: boolean;
  /** Token colour of the *next* section the wave leads into (e.g. 'canvas', 'surface', 'primary'). */
  fill?: Tone;
  /** Height utilities, default `h-12 md:h-20`. */
  heightClass?: string;
  className?: string;
}

const W = 1440;
const PATHS: Record<WaveStyle, { d: string; opacity: number }[]> = {
  smooth: [{ d: `M0 60 C240 120 480 0 720 40 C960 80 1200 110 ${W} 50 V120 H0 Z`, opacity: 1 }],
  layered: [
    { d: `M0 50 C300 110 600 0 900 50 C1100 85 1300 60 ${W} 30 V120 H0 Z`, opacity: 0.25 },
    { d: `M0 70 C260 20 560 110 860 70 C1100 40 1300 90 ${W} 60 V120 H0 Z`, opacity: 0.5 },
    { d: `M0 90 C320 50 620 120 920 85 C1140 60 1300 100 ${W} 80 V120 H0 Z`, opacity: 1 },
  ],
  curve: [{ d: `M0 0 Q${W / 2} 150 ${W} 0 V120 H0 Z`, opacity: 1 }],
  tilt: [{ d: `M0 120 L${W} 0 V120 Z`, opacity: 1 }],
  zigzag: [{ d: `M0 120 V60 ${Array.from({ length: 24 }, (_, i) => `L${(i + 0.5) * 60} ${i % 2 === 0 ? 20 : 60} L${(i + 1) * 60} 60`).join(' ')} V120 Z`, opacity: 1 }],
};

/**
 * Decorative SVG section divider painted in a token colour. Place at a section edge
 * (`relative` parent, `absolute inset-x-0 bottom-0` via className) or between sections.
 * `aria-hidden`; static (no motion), so it needs no reduced-motion variant.
 */
export function WaveDivider({ variant = 'smooth', position = 'bottom', flip, fill = 'surface', heightClass = 'h-12 md:h-20', className }: WaveDividerProps) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none block w-full overflow-hidden leading-[0]', position === 'top' && 'rotate-180', className)} data-testid="wave-divider">
      <svg
        viewBox={`0 0 ${W} 120`}
        preserveAspectRatio="none"
        focusable="false"
        className={cn('block w-full', heightClass, flip && '-scale-x-100', toneFill[fill])}
      >
        {PATHS[variant].map((p, i) => (
          <path key={i} d={p.d} fillOpacity={p.opacity} />
        ))}
      </svg>
    </div>
  );
}
