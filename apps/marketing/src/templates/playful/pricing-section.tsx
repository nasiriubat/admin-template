import Link from 'next/link';
import { Button, IconRenderer } from '@nexus/ui/marketing';
import { BouncyReveal } from './bouncy';

export interface PlayPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  featured?: boolean;
}

/** Rounded pricing with one highlighted plan that sits taller and wears a sticker. */
export function PricingSection({ plans }: { plans: PlayPlan[] }) {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="bg-surface pb-12 pt-2 md:pb-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 id="pricing-title" className="text-4xl font-extrabold tracking-tight text-balance md:text-5xl">Simple prices, no tricks</h2>
          <p className="mt-4 text-lg text-text-muted">Start free. Upgrade when your circle outgrows it, and cancel any time.</p>
        </div>
        <ul className="grid grid-cols-1 items-center gap-8 lg:grid-cols-3">
          {plans.map((p, i) => (
            <BouncyReveal as="li" key={p.name} delay={i * 0.1} tilt={0}>
              <div className={`relative flex flex-col rounded-[2.25rem] border-2 p-8 ${p.featured ? 'border-primary bg-primary text-primary-foreground shadow-popover lg:-my-4 lg:py-12' : 'border-border bg-canvas'}`}>
                {p.featured && <span className="absolute -top-4 right-6 rotate-6 rounded-full border-2 border-surface bg-warning px-4 py-1 text-sm font-extrabold text-warning-foreground">Most loved</span>}
                <h3 className="text-xl font-bold">{p.name}</h3>
                <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-5xl font-extrabold tracking-tight">{p.price}</span>
                  <span className={`text-sm ${p.featured ? 'opacity-90' : 'text-text-muted'}`}>{p.period}</span>
                </p>
                <p className={`mt-3 ${p.featured ? 'opacity-90' : 'text-text-muted'}`}>{p.description}</p>
                <ul className="my-7 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm font-medium">
                      <IconRenderer name="Check" className={`mt-0.5 size-5 shrink-0 ${p.featured ? '' : 'text-success'}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" variant={p.featured ? 'secondary' : 'primary'} className="min-h-12 rounded-full font-bold" asChild>
                  <Link href={p.cta.href}>{p.cta.label}</Link>
                </Button>
              </div>
            </BouncyReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
