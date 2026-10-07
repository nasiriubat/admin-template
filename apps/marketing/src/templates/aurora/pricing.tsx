import Link from 'next/link';
import { Button, GlowBorder, IconRenderer, RevealGroup, cn, type PricingTier } from '@nexus/ui/marketing';
import { Band } from './band';
import { AuroraHeading } from './heading';

function TierBody({ tier }: { tier: PricingTier }) {
  return (
    <div className="flex h-full flex-col p-6 md:p-8">
      {tier.featured && <p className="mb-3 w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Most popular</p>}
      <h3 className="text-lg font-semibold">{tier.name}</h3>
      <p className="mt-3 flex items-baseline gap-1">
        <span className="text-5xl font-semibold tracking-tight">{tier.price}</span>
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
      <Button variant={tier.featured ? 'primary' : 'secondary'} size="lg" asChild className="rounded-full">
        <Link href={tier.cta.href}>{tier.cta.label}</Link>
      </Button>
    </div>
  );
}

export function AuroraPricing({ tiers }: { tiers: PricingTier[] }) {
  return (
    <Band id="pricing" tone="canvas" next="surface" wave="smooth" labelledBy="pricing-title">
      <div className="mx-auto max-w-6xl px-4 pt-16 md:px-6 md:pt-24">
        <AuroraHeading id="pricing-title" eyebrow="Pricing" description="Start free. Upgrade when your product grows.">
          Simple, friendly pricing
        </AuroraHeading>
        <RevealGroup as="ul" itemAs="li" stagger={0.12} className="mx-auto grid grid-cols-1 max-w-5xl items-stretch gap-5 lg:grid-cols-3" itemClassName="h-full">
          {tiers.map((tier) =>
            tier.featured ? (
              <GlowBorder key={tier.name} className="h-full rounded-3xl shadow-popover lg:-my-3" innerClassName="rounded-[calc(1.5rem-2px)] bg-surface">
                <TierBody tier={tier} />
              </GlowBorder>
            ) : (
              <div key={tier.name} className={cn('h-full rounded-3xl border border-border bg-surface shadow-card')}>
                <TierBody tier={tier} />
              </div>
            ),
          )}
        </RevealGroup>
      </div>
    </Band>
  );
}
