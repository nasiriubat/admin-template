import type { Metadata } from 'next';
import { CtaBand, Faq, FeatureGrid, Hero, SectionShell, StatsBand, Testimonials } from '@nexus/ui';
import { SiteChrome } from '../../components/site-chrome';
import { enterprise } from '../../content/enterprise';

export const metadata: Metadata = {
  title: 'Enterprise and research template',
  description: 'Governed data and reproducible analysis for research teams.',
};

export default function EnterprisePage() {
  const { comparison } = enterprise;
  return (
    <SiteChrome brand={enterprise.brand} tagline={enterprise.tagline} links={enterprise.links} cta={enterprise.cta}>
      <Hero
        badge="For research and regulated teams"
        title="Reproducible research,"
        highlight="governed end to end"
        description="Versioned data, auditable access and repeatable analysis in a platform your security team can approve."
        primary={{ label: 'Book a demo', href: '#contact' }}
        secondary={{ label: 'View the platform', href: '#platform' }}
      />
      <StatsBand stats={enterprise.stats} />
      <FeatureGrid id="platform" eyebrow="Platform" title="Built for rigour and review" features={enterprise.features} />
      <SectionShell id="compare" title="Why teams move off spreadsheets and scripts">
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[32rem] text-sm">
            <caption className="sr-only">Comparison of spreadsheets and scripts with Nexus Research</caption>
            <thead>
              <tr className="border-b border-border text-left">
                <th scope="col" className="p-4 font-semibold">Capability</th>
                {comparison.columns.map((c) => (
                  <th key={c} scope="col" className="p-4 font-semibold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map(([label, a, b]) => (
                <tr key={label} className="border-b border-border last:border-0">
                  <th scope="row" className="p-4 text-left font-medium">{label}</th>
                  <td className="p-4 text-text-muted">{a}</td>
                  <td className="p-4 font-medium text-success">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionShell>
      <Testimonials id="security" title="Trusted where rigour matters" items={enterprise.testimonials} />
      <Faq id="faq" title="Procurement and security FAQ" items={enterprise.faq} />
      <div id="contact">
        <CtaBand title="See it with your own data" description="We will tailor a walkthrough to your workflows." primary={{ label: 'Book a demo', href: 'mailto:sales@example.com' }} />
      </div>
    </SiteChrome>
  );
}
