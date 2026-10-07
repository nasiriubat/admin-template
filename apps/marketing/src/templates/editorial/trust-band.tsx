import { CountUp, Marquee, Reveal } from '@nexus/ui/marketing';

export interface CountStat {
  value: number;
  suffix?: string;
  decimals?: number;
  label: string;
  note: string;
}

/** Surface band with a marquee of institution names above the animated headline numbers. */
export function TrustBand({ institutions, stats }: { institutions: string[]; stats: CountStat[] }) {
  return (
    <div className="bg-surface pb-16 pt-6 md:pb-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-text-muted">Trusted by teams at</p>
        <Marquee label="Institutions that use Nexus Research" speed={36} gap={56} className="mt-6">
          {institutions.map((name) => (
            <span key={name} className="whitespace-nowrap text-lg font-semibold tracking-tight text-text-muted md:text-xl">{name}</span>
          ))}
        </Marquee>
        <dl className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="flex flex-col bg-surface-elevated p-6 md:p-8">
              <dt className="order-2 mt-2 font-medium">{s.label}</dt>
              <dd className="order-1 text-4xl font-semibold tracking-tight text-primary md:text-5xl">
                <CountUp value={s.value} suffix={s.suffix} decimals={s.decimals} />
              </dd>
              <dd className="order-3 mt-1 text-sm text-text-muted">{s.note}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </div>
  );
}
