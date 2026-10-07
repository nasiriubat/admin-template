import { CountUp, FloatingShapes, Reveal } from '@nexus/ui/marketing';
import { Band } from './band';

export interface StatItem {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const shapes = [
  { kind: 'ring' as const, x: 6, y: 20, size: 56, tone: 'canvas' as const, opacity: 0.2, duration: 9 },
  { kind: 'circle' as const, x: 92, y: 30, size: 28, tone: 'accent' as const, opacity: 0.5, duration: 7 },
  { kind: 'plus' as const, x: 80, y: 78, size: 30, tone: 'canvas' as const, opacity: 0.25, duration: 8, delay: 1 },
  { kind: 'star' as const, x: 14, y: 76, size: 26, tone: 'canvas' as const, opacity: 0.3, duration: 10, delay: 2 },
];

export function AuroraStats({ stats }: { stats: StatItem[] }) {
  return (
    <Band tone="primary" next="surface" wave="smooth" labelledBy="stats-title" className="text-primary-foreground">
      <FloatingShapes shapes={shapes} />
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <h2 id="stats-title" className="sr-only">
          Nexus in numbers
        </h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="text-center">
              <dd className="order-1 text-5xl font-semibold tracking-tight md:text-6xl">
                <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
              </dd>
              <dt className="mt-2 text-sm font-medium opacity-90 md:text-base">{s.label}</dt>
            </Reveal>
          ))}
        </dl>
      </div>
    </Band>
  );
}
