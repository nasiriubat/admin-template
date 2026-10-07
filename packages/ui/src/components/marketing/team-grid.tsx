import Link from 'next/link';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { SectionShell } from './marketing-nav';
import { Reveal } from './motion/reveal';

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

/** Team cards with initials avatars (no photos to license). */
export function TeamGrid({ id, eyebrow, title, description, members }: { id?: string; eyebrow?: string; title: string; description?: string; members: TeamMember[] }) {
  return (
    <SectionShell id={id} eyebrow={eyebrow} title={title} description={description}>
      <ul className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-4">
        {members.map((m, i) => (
          <Reveal as="li" key={m.name} delay={(i % 4) * 0.08} variant="scale" className="rounded-card border border-border bg-surface p-5 shadow-card transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
            <Avatar name={m.name} size="lg" />
            <h3 className="mt-4 font-semibold">{m.name}</h3>
            <p className="text-sm text-primary">{m.role}</p>
            <p className="mt-2 text-sm text-text-muted">{m.bio}</p>
          </Reveal>
        ))}
      </ul>
    </SectionShell>
  );
}

export interface CaseStudy {
  slug?: string;
  company: string;
  industry: string;
  headline: string;
  summary: string;
  metrics: Array<{ value: string; label: string }>;
  href?: string;
}

export function CaseStudyCards({ id, eyebrow, title, description, items }: { id?: string; eyebrow?: string; title: string; description?: string; items: CaseStudy[] }) {
  return (
    <SectionShell id={id} eyebrow={eyebrow} title={title} description={description}>
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {items.map((c, i) => (
          <Reveal as="li" key={c.company} delay={i * 0.1}>
            <article className="flex h-full flex-col rounded-card border border-border bg-surface p-6 shadow-card transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <Badge variant="neutral" className="self-start">
                {c.industry}
              </Badge>
              <p className="mt-4 text-sm font-semibold text-primary">{c.company}</p>
              <h3 className="mt-1 text-xl font-semibold leading-snug">{c.headline}</h3>
              <p className="mt-3 flex-1 text-sm text-text-muted">{c.summary}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5">
                {c.metrics.map((m) => (
                  <div key={m.label} className="flex flex-col">
                    <dt className="order-2 text-xs text-text-muted">{m.label}</dt>
                    <dd className="order-1 text-2xl font-semibold tracking-tight">{m.value}</dd>
                  </div>
                ))}
              </dl>
              {c.href && (
                <Link href={c.href} className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline">
                  Read the story<span className="sr-only"> about {c.company}</span>
                </Link>
              )}
            </article>
          </Reveal>
        ))}
      </ul>
    </SectionShell>
  );
}

/** Single large pull quote. */
export function PullQuote({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <section aria-label="Customer quote" className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
      <figure className="text-center">
        <blockquote className="text-2xl font-medium leading-snug tracking-tight md:text-3xl">“{quote}”</blockquote>
        <figcaption className="mt-8 flex flex-col items-center gap-3">
          <Avatar name={name} size="lg" />
          <span className="text-sm">
            <span className="block font-semibold">{name}</span>
            <span className="text-text-muted">{role}</span>
          </span>
        </figcaption>
      </figure>
    </section>
  );
}
