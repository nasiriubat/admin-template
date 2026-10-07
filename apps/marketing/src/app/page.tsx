import type { Metadata } from 'next';
import { BentoGrid, CtaBand, Faq, FeatureGrid, Hero, LogoCloud, Pricing, StatsBand, StickyShowcase, Testimonials } from '@nexus/ui';
import { SiteChrome } from '../components/site-chrome';
import { saas } from '../content/saas';
import { ProductPreview } from '../components/product-preview';

export const metadata: Metadata = {
  title: 'Admin and landing pages from one design system',
  description: 'A themeable, accessible, mobile-first admin framework with matching marketing templates.',
};

export default function SaasPage() {
  return (
    <SiteChrome brand={saas.brand} tagline={saas.tagline} links={saas.links} cta={saas.cta}>
      <Hero
        badge="Admin dashboard and landing pages"
        title="Ship a product that looks"
        highlight="designed from day one"
        description="A themeable, accessible and mobile-first admin framework with matching marketing templates. Configure it, connect your API and launch."
        primary={{ label: 'Start free', href: '#pricing' }}
        secondary={{ label: 'See features', href: '#features' }}
        visual={<ProductPreview />}
      />
      <LogoCloud title="Trusted by product teams at" logos={saas.logos} />
      <FeatureGrid id="features" eyebrow="Features" title="Everything an admin needs, nothing you have to rebuild" description="Every module shares the same tokens, components and states." features={saas.features} />
      <StatsBand stats={saas.stats} />
      <StickyShowcase
        id="workflow"
        eyebrow="Workflow"
        title="From config file to production"
        description="Three steps, no custom design system required."
        steps={saas.steps.map((s, i) => ({ ...s, visual: <ProductPreview compact highlight={i} /> }))}
      />
      <BentoGrid
        title="Built for real products"
        items={[
          { icon: 'Users', title: 'Users, roles and audit', description: 'The administration basics are done, tested and permission-aware.', span: 'wide' },
          { icon: 'Smartphone', title: 'Installable PWA', description: 'Offline fallback and home-screen install.' },
          { icon: 'Palette', title: 'Theme editor', description: 'Live preview with contrast checks.' },
          { icon: 'Terminal', title: 'Ops tooling', description: 'Logs, jobs, health and feature flags.', span: 'wide' },
        ]}
      />
      <Testimonials title="Teams ship faster with Nexus" items={saas.testimonials} />
      <Pricing id="pricing" title="Simple pricing" description="Start free. Upgrade when your product grows." tiers={saas.tiers} />
      <Faq id="faq" title="Questions, answered" items={saas.faq} />
      <CtaBand title="Build your next admin in an afternoon" description="Start with a design system that is already finished." primary={{ label: 'Start free', href: '#pricing' }} />
    </SiteChrome>
  );
}
