import type { Metadata } from 'next';
import { ScrollProgress } from '@nexus/ui/marketing';
import { SiteChrome } from '../../components/site-chrome';
import { ai } from '../../content/ai';
import { NeonCode, NeonCta, NeonFaq, NeonFeatures, NeonHero, NeonIntegrations, NeonMetrics, NeonPipeline, NeonPricing, NeonWorkflow } from '../../templates/neon';

export const metadata: Metadata = {
  title: 'AI product template',
  description: 'Retrieval, prompts and evaluations in one workspace.',
};

/**
 * "Neon" template. The page body is a local dark island (`bg-secondary text-secondary-foreground`),
 * which stays dark in both colour modes; the shared header and footer follow the active theme.
 */
export default function AiPage() {
  return (
    <SiteChrome brand={ai.brand} tagline={ai.tagline} links={ai.links} cta={ai.cta}>
      <ScrollProgress tone="info" />
      <div className="bg-secondary text-secondary-foreground">
        <NeonHero words={ai.heroWords} />
        <NeonIntegrations items={ai.integrations} />
        <NeonPipeline stages={ai.pipeline} />
        <NeonFeatures features={ai.features} />
        <NeonMetrics metrics={ai.stats} />
        <NeonCode code={ai.snippet} />
        <NeonWorkflow steps={ai.steps} />
        <NeonPricing tiers={ai.tiers} />
        <NeonFaq items={ai.faq} />
        <NeonCta />
      </div>
    </SiteChrome>
  );
}
