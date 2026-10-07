import { FeatureRows, IntegrationsGrid, PageHero, TrustBand, Button } from '@nexus/ui';
import Link from 'next/link';
import { Page } from '../../components/page';
import { ShellVisual, TableVisual, ThemeVisual } from '../../components/feature-visuals';
import { featureGroups, integrations, securityItems } from '../../content/features';
import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({ title: 'Features', description: 'An app shell, data tables, theming, integrations and security built into one framework.', path: '/features' });

const visuals = { shell: <ShellVisual />, data: <TableVisual />, theme: <ThemeVisual /> } as const;

export default function FeaturesPage() {
  return (
    <Page>
      <PageHero eyebrow="Features" title="Everything an admin needs, nothing you have to rebuild" description="Every module shares the same tokens, components and states, so the whole product feels intentional.">
        <Button size="lg" asChild>
          <Link href="/pricing">See pricing</Link>
        </Button>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/docs">Read the docs</Link>
        </Button>
      </PageHero>
      <FeatureRows items={featureGroups.map((g) => ({ ...g, bullets: [...g.bullets], visual: visuals[g.id] }))} />
      <IntegrationsGrid id="integrations" eyebrow="Integrations" title="Connect the systems you already use" description="A typed API client and documented contracts work with any backend." items={integrations} />
      <TrustBand id="security" title="Security and compliance" description="Security is part of the framework, not an add-on." items={securityItems} />
    </Page>
  );
}
