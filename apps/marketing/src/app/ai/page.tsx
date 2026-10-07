import type { Metadata } from 'next';
import { BentoGrid, CtaBand, ExplodedView, Faq, Hero, Pricing, StatsBand, StickyShowcase } from '@nexus/ui';
import { ProductPreview } from '../../components/product-preview';
import { SiteChrome } from '../../components/site-chrome';
import { ai } from '../../content/ai';

export const metadata: Metadata = {
  title: 'AI product template',
  description: 'Retrieval, prompts and evaluations in one workspace.',
};

export default function AiPage() {
  return (
    <SiteChrome brand={ai.brand} tagline={ai.tagline} links={ai.links} cta={ai.cta}>
      <Hero
        badge="Retrieval-augmented generation"
        title="Answers your team can"
        highlight="trust and trace"
        description="Connect your knowledge, version your prompts and measure quality continuously, without stitching together five tools."
        primary={{ label: 'Request access', href: '#pricing' }}
        secondary={{ label: 'See the pipeline', href: '#pipeline' }}
      />
      <ExplodedView id="pipeline" eyebrow="Architecture" title="One pipeline, five layers" description="Each layer is observable and replaceable. Scroll to see how they fit together." layers={ai.layers} />
      <StatsBand stats={ai.stats} />
      <StickyShowcase id="showcase" eyebrow="Workspace" title="Everything in one place" steps={ai.steps.map((s, i) => ({ ...s, visual: <ProductPreview compact highlight={i} /> }))} />
      <BentoGrid title="Designed for production" items={ai.bento} />
      <Pricing id="pricing" title="Pricing that scales with usage" tiers={ai.tiers} />
      <Faq id="faq" title="Frequently asked" items={ai.faq} />
      <CtaBand title="Put trustworthy answers in front of your users" description="Join the early access program." primary={{ label: 'Request access', href: '#pricing' }} />
    </SiteChrome>
  );
}
