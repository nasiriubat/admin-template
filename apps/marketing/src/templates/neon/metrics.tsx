import { CountUp, Reveal, cn } from '@nexus/ui/marketing';
import { neon } from './neon';

export interface Metric {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function NeonMetrics({ metrics }: { metrics: Metric[] }) {
  return (
    <section aria-labelledby="metrics-title" className="relative mx-auto max-w-6xl px-4 pb-20 md:px-6 md:pb-28">
      <h2 id="metrics-title" className="sr-only">
        Platform metrics
      </h2>
      <dl className={cn('grid grid-cols-2 gap-px overflow-hidden rounded-3xl lg:grid-cols-4', neon.glassStrong)}>
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 0.08} className={cn('p-6 text-center md:p-8', neon.glass)}>
            <dd className="font-mono text-4xl font-semibold tracking-tight md:text-5xl">
              <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} decimals={m.decimals} />
            </dd>
            <dt className={cn('mt-2 text-sm', neon.muted)}>{m.label}</dt>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
