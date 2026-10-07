import { Carousel } from '@nexus/ui/marketing';
import { PullQuote } from './pull-quote';
import { SectionHeading } from './section-heading';

export interface CaseStudy {
  quote: string;
  name: string;
  role: string;
  org: string;
  metric: string;
  metricLabel: string;
}

/** Case-study carousel: each slide pairs a pull quote with its headline result. Pausable, keyboard operable. */
export function CaseStudies({ cases }: { cases: CaseStudy[] }) {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6" role="group" aria-labelledby="cases-title">
      <SectionHeading id="cases-title" eyebrow="Case studies" title="Trusted where rigour matters" />
      <Carousel label="Customer case studies" autoplay interval={9000}>
        {cases.map((c) => (
          <article key={c.name} aria-label={`${c.org} case study`} className="grid grid-cols-1 gap-8 rounded-3xl border border-border bg-surface p-6 md:grid-cols-[1.6fr_1fr] md:gap-12 md:p-12">
            <PullQuote quote={c.quote} name={c.name} role={c.role} org={c.org} />
            <div className="flex flex-col justify-center rounded-2xl bg-primary/10 p-6 text-center md:p-8">
              <p className="text-5xl font-semibold tracking-tight text-primary md:text-6xl">{c.metric}</p>
              <p className="mt-3 text-text-muted">{c.metricLabel}</p>
            </div>
          </article>
        ))}
      </Carousel>
    </div>
  );
}
