import type { Metadata } from 'next';
import { ScrollProgress, SectionNav } from '@nexus/ui/marketing';
import { SiteChrome } from '../../components/site-chrome';
import { playful } from '../../content/playful';
import { CommunitySection } from '../../templates/playful/community-section';
import { Divider } from '../../templates/playful/divider';
import { FaqSection } from '../../templates/playful/faq-section';
import { FeaturesSection } from '../../templates/playful/features-section';
import { FinalCta } from '../../templates/playful/final-cta';
import { HowSection } from '../../templates/playful/how-section';
import { PlayfulHero } from '../../templates/playful/hero';
import { PricingSection } from '../../templates/playful/pricing-section';

export const metadata: Metadata = {
  title: 'Playful template',
  description: 'A bold, friendly landing page for consumer apps and communities.',
};

/** Playful template: blobs, stickers, tilt cards, spring reveals and a wave between every section. */
export default function PlayfulPage() {
  const p = playful;
  return (
    <SiteChrome brand={p.brand} tagline={p.tagline} links={p.links} cta={p.cta}>
      <ScrollProgress className="fixed inset-x-0 top-0 z-50" tone="danger" heightClass="h-1" />
      <SectionNav sections={p.sections} label="Page sections" />
      <PlayfulHero {...p.hero} people={p.people} stickers={p.stickers} phone={p.phone} />
      <Divider from="canvas" to="surface" variant="smooth" />
      <FeaturesSection features={p.features} />
      <Divider from="surface" to="secondary" variant="layered" />
      <HowSection steps={p.steps} />
      <Divider from="secondary" to="canvas" variant="curve" />
      <CommunitySection chips={p.chips} testimonials={p.testimonials} people={p.people} />
      <Divider from="canvas" to="surface" variant="zigzag" />
      <PricingSection plans={p.pricing} />
      <Divider from="surface" to="canvas" variant="tilt" flip />
      <FaqSection items={p.faq} />
      <Divider from="canvas" to="primary" variant="smooth" flip />
      <FinalCta />
    </SiteChrome>
  );
}
