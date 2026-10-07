import { CtaBand, Faq, Pricing, ScrollProgress } from '@nexus/ui/marketing';
import { SiteChrome } from '../../components/site-chrome';
import { productFaq, productLinks, productTiers } from '../../content/product';
import { IntegrationsStrip } from '../../templates/product/integrations-strip';
import { Metrics } from '../../templates/product/metrics';
import { PhoneShowcase } from '../../templates/product/phone-showcase';
import { ProductHero } from '../../templates/product/product-hero';
import { ScreensCarousel } from '../../templates/product/screens-carousel';
import { WhatsNew } from '../../templates/product/whats-new';
import { ZoomStory } from '../../templates/product/zoom-story';
import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({ title: 'Product template', description: 'A product-led launch page with device mockups, a scroll-driven zoom story and a phone showcase.', path: '/product' });

export default function ProductPage() {
  return (
    <SiteChrome links={productLinks} cta={{ label: 'Start free', href: '#pricing' }}>
      <ScrollProgress />
      <ProductHero />
      <ZoomStory />
      <ScreensCarousel />
      <PhoneShowcase />
      <Metrics />
      <IntegrationsStrip />
      <WhatsNew />
      <Pricing id="pricing" title="Simple pricing" description="Start free. Upgrade when your product grows." tiers={productTiers} />
      <Faq id="faq" title="Questions, answered" items={productFaq} />
      <CtaBand title="Make your product feel finished" description="Start with a design system that is already done." primary={{ label: 'Start free', href: '#pricing' }} secondary={{ label: 'Read the docs', href: '/docs' }} />
    </SiteChrome>
  );
}
