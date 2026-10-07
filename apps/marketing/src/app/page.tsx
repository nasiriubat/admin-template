import type { Metadata } from 'next';
import { ScrollProgress } from '@nexus/ui/marketing';
import { SiteChrome } from '../components/site-chrome';
import { saas } from '../content/saas';
import { AuroraBento, AuroraCta, AuroraFaq, AuroraHero, AuroraPricing, AuroraStats, AuroraStory, AuroraTestimonials } from '../templates/aurora';

export const metadata: Metadata = {
  title: 'Admin and landing pages from one design system',
  description: 'A themeable, accessible, mobile-first admin framework with matching marketing templates.',
};

/** "Aurora" template: soft gradients, floating UI, wave dividers between every section. */
export default function SaasPage() {
  return (
    <SiteChrome brand={saas.brand} tagline={saas.tagline} links={saas.links} cta={saas.cta}>
      <ScrollProgress tone="accent" />
      <AuroraHero words={saas.heroWords} logos={saas.logos} />
      <AuroraBento items={saas.bento} features={saas.features} />
      <AuroraStory steps={saas.steps} />
      <AuroraStats stats={saas.stats} />
      <AuroraTestimonials items={saas.testimonials} people={saas.people} />
      <AuroraPricing tiers={saas.tiers} />
      <AuroraFaq items={saas.faq} />
      <AuroraCta />
    </SiteChrome>
  );
}
