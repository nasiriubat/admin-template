import { CaseStudyCards, Marquee, PageHero, PullQuote, Reveal } from '@nexus/ui/marketing';
import { Page } from '../../components/page';
import { caseStudies, customerLogos, customerQuote } from '../../content/customers';
import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({ title: 'Customers', description: 'How product teams use Nexus to ship admin tools and websites faster.', path: '/customers' });

export default function CustomersPage() {
  return (
    <Page>
      <PageHero eyebrow="Customers" title="Teams that ship with Nexus" description="Illustrative case studies showing the kinds of results teams aim for." />
      <section aria-label="Trusted by product teams" className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <p className="mb-6 text-center text-sm font-medium text-text-muted">Trusted by product teams at</p>
        <Marquee label="Customer names" speed={35} gap={56}>
          {customerLogos.map((name) => (
            <span key={name} className="text-2xl font-semibold tracking-tight text-text-muted">
              {name}
            </span>
          ))}
        </Marquee>
      </section>
      <CaseStudyCards id="stories" title="Customer stories" items={caseStudies} />
      <Reveal variant="blur">
        <PullQuote {...customerQuote} />
      </Reveal>
    </Page>
  );
}
