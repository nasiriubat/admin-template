import Link from 'next/link';
import { Button, GlowBorder, IconRenderer, RevealGroup, cn, type PricingTier } from '@nexus/ui/marketing';
import { NeonHeading } from './heading';
import { neon } from './neon';

function Tier({ tier }: { tier: PricingTier }) {
  return (
    <div className="flex h-full flex-col p-6 md:p-8">
      {tier.featured && <p className="mb-3 w-fit rounded-full bg-primary px-3 py-1 font-mono text-xs font-semibold text-primary-foreground">Recommended</p>}
      <h3 className="text-lg font-semibold">{tier.name}</h3>
      <p className="mt-3 flex items-baseline gap-1">
        <span className="font-mono text-5xl font-semibold tracking-tight">{tier.price}</span>
        {tier.period && <span className={cn('text-sm', neon.muted)}>{tier.period}</span>}
      </p>
      <p className={cn('mt-2 text-sm', neon.muted)}>{tier.description}</p>
      <ul className="my-6 flex-1 space-y-2.5 text-sm">
        {tier.features.map((f) => (
          <li key={f} className="flex gap-2.5">
            <IconRenderer name="Check" className="mt-0.5 size-4 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button variant={tier.featured ? 'primary' : 'secondary'} size="lg" asChild>
        <Link href={tier.cta.href}>{tier.cta.label}</Link>
      </Button>
    </div>
  );
}

export function NeonPricing({ tiers }: { tiers: PricingTier[] }) {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="relative mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
      <NeonHeading id="pricing-title" eyebrow="Pricing" description="Start with one workspace. Scale with usage.">
        Pricing that scales with usage
      </NeonHeading>
      <RevealGroup as="ul" itemAs="li" stagger={0.1} className="mx-auto grid grid-cols-1 max-w-5xl gap-5 lg:grid-cols-3" itemClassName="h-full">
        {tiers.map((tier) =>
          tier.featured ? (
            <GlowBorder key={tier.name} className="h-full rounded-3xl shadow-popover" innerClassName="rounded-[calc(1.5rem-2px)] bg-secondary text-secondary-foreground" thickness={2}>
              <Tier tier={tier} />
            </GlowBorder>
          ) : (
            <div key={tier.name} className={cn('h-full rounded-3xl', neon.panel)}>
              <Tier tier={tier} />
            </div>
          ),
        )}
      </RevealGroup>
    </section>
  );
}
