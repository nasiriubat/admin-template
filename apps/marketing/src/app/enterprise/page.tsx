import type { Metadata } from 'next';
import { CurvedSection, Faq, ScrollProgress, SectionNav } from '@nexus/ui/marketing';
import { SiteChrome } from '../../components/site-chrome';
import { enterprise } from '../../content/enterprise';
import { CaseStudies } from '../../templates/editorial/case-studies';
import { ClosingCta } from '../../templates/editorial/closing-cta';
import { ComparisonTable } from '../../templates/editorial/comparison-table';
import { EditorialHero } from '../../templates/editorial/hero';
import { LineageSection } from '../../templates/editorial/lineage-section';
import { OnboardingSection } from '../../templates/editorial/onboarding-section';
import { PlatformSection } from '../../templates/editorial/platform-section';
import { SecurityGrid } from '../../templates/editorial/security-grid';
import { TrustBand } from '../../templates/editorial/trust-band';

export const metadata: Metadata = {
  title: 'Enterprise and research template',
  description: 'Governed data and reproducible analysis for research teams.',
};

const section = 'py-16 md:py-24';

/** Editorial template: calm, curved sections, layered lineage illustration and a case-study carousel. */
export default function EnterprisePage() {
  const e = enterprise;
  return (
    <SiteChrome brand={e.brand} tagline={e.tagline} links={e.links} cta={e.cta}>
      <ScrollProgress className="fixed inset-x-0 top-0 z-50" heightClass="h-0.5" />
      <SectionNav sections={e.sections} label="Page sections" />
      <EditorialHero proof={e.proof} />
      <TrustBand institutions={e.institutions} stats={e.countStats} />
      <CurvedSection id="platform" tone="canvas" outerTone="surface" contentClassName={section}>
        <PlatformSection features={e.features} />
      </CurvedSection>
      <CurvedSection id="lineage" tone="surface" outerTone="canvas" contentClassName={section}>
        <LineageSection lineage={e.lineage} />
      </CurvedSection>
      <CurvedSection id="cases" tone="canvas" outerTone="surface" contentClassName={section}>
        <CaseStudies cases={e.cases} />
      </CurvedSection>
      <CurvedSection id="security" tone="surface" outerTone="canvas" contentClassName={section}>
        <SecurityGrid items={e.security} />
      </CurvedSection>
      <CurvedSection id="compare" tone="canvas" outerTone="surface" contentClassName={section}>
        <ComparisonTable comparison={e.comparison} />
      </CurvedSection>
      <CurvedSection id="onboarding" tone="surface" outerTone="canvas" contentClassName={section}>
        <OnboardingSection steps={e.onboarding} />
      </CurvedSection>
      <CurvedSection id="faq" tone="canvas" outerTone="surface" contentClassName="pb-8 md:pb-16">
        <Faq title="Procurement and security FAQ" items={e.faq} />
      </CurvedSection>
      <ClosingCta />
    </SiteChrome>
  );
}
