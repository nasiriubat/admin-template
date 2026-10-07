import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';
import { BrandMark } from '../shell/brand-mark';
import { Button } from '../ui/button';
import type { MarketingLink } from './marketing-nav';
import { SectionShell } from './marketing-nav';
import { CountUp } from './motion/count-up';
import { Orbs } from './motion/backgrounds';
import { Reveal } from './motion/reveal';
import { Sparkles } from './motion/decorations';
import { parseStat } from './stat-utils';

export function LogoCloud({ title, logos }: { title: string; logos: string[] }) {
  return (
    <section aria-label={title} className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <p className="mb-6 text-center text-sm font-medium text-text-muted">{title}</p>
      <ul className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 md:grid-cols-6">
        {logos.map((name) => (
          <li key={name} className="text-center text-lg font-semibold tracking-tight text-text-muted">
            {name}
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export function FeatureGrid({ id, eyebrow, title, description, features }: { id?: string; eyebrow?: string; title: string; description?: string; features: Feature[] }) {
  return (
    <SectionShell id={id} eyebrow={eyebrow} title={title} description={description}>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Reveal as="li" key={f.title} delay={(i % 3) * 0.08} className="rounded-card border border-border bg-surface p-6 shadow-card transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
            <span className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <IconRenderer name={f.icon} className="size-5" />
            </span>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-text-muted">{f.description}</p>
          </Reveal>
        ))}
      </ul>
    </SectionShell>
  );
}

export interface BentoItem extends Feature {
  span?: 'wide' | 'tall' | 'normal';
  visual?: ReactNode;
}

export function BentoGrid({ id, eyebrow, title, description, items }: { id?: string; eyebrow?: string; title: string; description?: string; items: BentoItem[] }) {
  return (
    <SectionShell id={id} eyebrow={eyebrow} title={title} description={description}>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[minmax(14rem,auto)]">
        {items.map((item) => (
          <li
            key={item.title}
            className={cn(
              'flex flex-col justify-between overflow-hidden rounded-card border border-border bg-surface p-6 shadow-card',
              item.span === 'wide' && 'md:col-span-2',
              item.span === 'tall' && 'md:row-span-2',
            )}
          >
            <div>
              <span className="mb-4 grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <IconRenderer name={item.icon} className="size-5" />
              </span>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{item.description}</p>
            </div>
            {item.visual && <div className="mt-6">{item.visual}</div>}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export interface StatItem {
  /** Display text ("99.9%") or a number to count up to (combine with prefix/suffix/decimals). */
  value: string | number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

/** Key figures. Numbers (or numeric strings such as "99.9%") count up when scrolled into view. */
export function StatsBand({ stats }: { stats: StatItem[] }) {
  return (
    <section aria-label="Key figures" className="border-y border-border bg-surface">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
        {stats.map((s, i) => {
          const parsed = typeof s.value === 'number' ? { value: s.value, prefix: s.prefix ?? '', suffix: s.suffix ?? '', decimals: s.decimals ?? 0 } : parseStat(s.value);
          return (
            <Reveal key={s.label} delay={i * 0.08} className="text-center">
              <dt className="order-2 mt-1 text-sm text-text-muted">{s.label}</dt>
              <dd className="text-3xl font-semibold tracking-tight text-text md:text-4xl">{parsed ? <CountUp value={parsed.value} prefix={parsed.prefix} suffix={parsed.suffix} decimals={parsed.decimals} /> : s.value}</dd>
            </Reveal>
          );
        })}
      </dl>
    </section>
  );
}

export function Testimonials({ id, title, items }: { id?: string; title: string; items: Array<{ quote: string; name: string; role: string }> }) {
  return (
    <SectionShell id={id} title={title}>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((t) => (
          <li key={t.name}>
            <figure className="flex h-full flex-col justify-between rounded-card border border-border bg-surface p-6 shadow-card">
              <blockquote className="text-text">“{t.quote}”</blockquote>
              <figcaption className="mt-6 text-sm">
                <span className="font-semibold">{t.name}</span>
                <span className="block text-text-muted">{t.role}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: MarketingLink;
  featured?: boolean;
}

export function Pricing({ id, title, description, tiers }: { id?: string; title: string; description?: string; tiers: PricingTier[] }) {
  return (
    <SectionShell id={id} title={title} description={description}>
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {tiers.map((tier) => (
          <li key={tier.name} className={cn('flex flex-col rounded-card border bg-surface p-6 shadow-card', tier.featured ? 'border-primary ring-1 ring-primary' : 'border-border')}>
            <h3 className="font-semibold">{tier.name}</h3>
            <p className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tight">{tier.price}</span>
              {tier.period && <span className="text-sm text-text-muted">{tier.period}</span>}
            </p>
            <p className="mt-2 text-sm text-text-muted">{tier.description}</p>
            <ul className="my-6 flex-1 space-y-2.5 text-sm">
              {tier.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <IconRenderer name="Check" className="mt-0.5 size-4 shrink-0 text-success" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button variant={tier.featured ? 'primary' : 'secondary'} asChild>
              <Link href={tier.cta.href}>{tier.cta.label}</Link>
            </Button>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

/** Accessible accordion using native <details>: keyboard + screen reader support with no JS. */
export function Faq({ id, title, items }: { id?: string; title: string; items: Array<{ q: string; a: string }> }) {
  return (
    <SectionShell id={id} title={title} className="max-w-3xl">
      <div className="divide-y divide-border rounded-card border border-border bg-surface">
        {items.map((item) => (
          <details key={item.q} className="group p-5">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
              <IconRenderer name="ChevronDown" className="size-4 shrink-0 text-text-muted transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}

export function CtaBand({ title, description, primary, secondary }: { title: string; description: string; primary: MarketingLink; secondary?: MarketingLink }) {
  return (
    <section aria-label="Get started" className="mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-24">
      <Reveal variant="scale" className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground md:px-12">
        <Orbs tones={['accent', 'info']} intensity="vivid" className="-z-10" />
        <Sparkles className="absolute inset-0 -z-10" count={8} />
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg opacity-90">{description}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" variant="secondary" asChild>
            <Link href={primary.href}>{primary.label}</Link>
          </Button>
          {secondary && (
            <Button size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          )}
        </div>
      </Reveal>
    </section>
  );
}

export function MarketingFooter({ brand, tagline, columns }: { brand: string; tagline: string; columns: Array<{ title: string; links: MarketingLink[] }> }) {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid grid-cols-1 max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)] md:px-6">
        <div className="space-y-3">
          <p className="flex items-center gap-2.5 font-semibold">
            <BrandMark className="size-8 text-sm" /> {brand}
          </p>
          <p className="max-w-xs text-sm text-text-muted">{tagline}</p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="mb-3 text-sm font-semibold">{col.title}</h3>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-text-muted hover:text-text hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="border-t border-border px-4 py-5 text-center text-xs text-text-muted">© {new Date().getFullYear()} {brand}. All rights reserved.</p>
    </footer>
  );
}
