import { cn } from '../../../lib/utils';
import { Float } from './float';
import { seeded } from './tones';
import { toneFill, toneStroke, type Tone } from './tones';

export type ShapeKind = 'circle' | 'ring' | 'triangle' | 'plus' | 'star';

export interface FloatingShape {
  kind: ShapeKind;
  /** Position as CSS percentages of the container. */
  x: number;
  y: number;
  /** px */
  size?: number;
  tone?: Tone;
  rotate?: number;
  /** Seconds */
  duration?: number;
  delay?: number;
  opacity?: number;
}

export interface FloatingShapesProps {
  /** Explicit shapes; if omitted `count` seeded shapes are generated. */
  shapes?: FloatingShape[];
  count?: number;
  kinds?: ShapeKind[];
  tones?: Tone[];
  seed?: number;
  /** Freeze the float loops. */
  paused?: boolean;
  className?: string;
}

function Glyph({ kind, tone }: { kind: ShapeKind; tone: Tone }) {
  const fill = toneFill[tone];
  const stroke = toneStroke[tone];
  const common = { viewBox: '0 0 24 24', focusable: false as const, className: 'size-full' };
  switch (kind) {
    case 'circle':
      return <svg {...common}><circle cx="12" cy="12" r="10" className={fill} /></svg>;
    case 'ring':
      return <svg {...common}><circle cx="12" cy="12" r="9" fill="none" strokeWidth="3" className={stroke} /></svg>;
    case 'triangle':
      return <svg {...common}><path d="M12 3 L22 21 H2 Z" fill="none" strokeWidth="2.5" strokeLinejoin="round" className={stroke} /></svg>;
    case 'plus':
      return <svg {...common}><path d="M12 3 V21 M3 12 H21" strokeWidth="3.5" strokeLinecap="round" className={stroke} /></svg>;
    case 'star':
      return <svg {...common}><path d="M12 1 L15 9 L23 12 L15 15 L12 23 L9 15 L1 12 L9 9 Z" className={fill} /></svg>;
  }
}

const ALL: ShapeKind[] = ['circle', 'ring', 'triangle', 'plus', 'star'];

/** Configurable set of decorative floating SVG shapes. Fills its `relative` parent, aria-hidden, static under reduced motion. */
export function FloatingShapes({ shapes, count = 8, kinds = ALL, tones = ['primary', 'accent', 'secondary', 'info'], seed = 11, paused, className }: FloatingShapesProps) {
  const list: FloatingShape[] =
    shapes ??
    (() => {
      const r = seeded(seed);
      return Array.from({ length: count }, (_, i) => ({
        kind: kinds[i % kinds.length]!,
        tone: tones[i % tones.length]!,
        x: 4 + r() * 92,
        y: 4 + r() * 88,
        size: 14 + r() * 30,
        rotate: 4 + r() * 14,
        duration: 5 + r() * 5,
        delay: -r() * 6,
        opacity: 0.35 + r() * 0.4,
      }));
    })();
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} data-testid="floating-shapes">
      {list.map((s, i) => (
        <Float
          key={i}
          amplitude={14}
          duration={s.duration ?? 7}
          delay={s.delay ?? 0}
          rotate={s.rotate ?? 8}
          paused={paused}
          className="absolute"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size ?? 24, height: s.size ?? 24, opacity: s.opacity ?? 0.6 }}
        >
          <Glyph kind={s.kind} tone={s.tone ?? 'primary'} />
        </Float>
      ))}
    </div>
  );
}
