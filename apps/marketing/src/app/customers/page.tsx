import { CaseStudyCards, LogoCloud, PageHero, PullQuote } from '@nexus/ui';
import { Page } from '../../components/page';
import { caseStudies, customerLogos, customerQuote } from '../../content/customers';
import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({ title: 'Customers', description: 'How product teams use Nexus to ship admin tools and websites faster.', path: '/customers' });

export default function CustomersPage() {
  return (
    <Page>
      <PageHero eyebrow="Customers" title="Teams that ship with Nexus" description="Illustrative case studies showing the kinds of results teams aim for." />
      <LogoCloud title="Trusted by product teams at" logos={customerLogos} />
      <CaseStudyCards id="stories" title="Customer stories" items={caseStudies} />
      <PullQuote {...customerQuote} />
    </Page>
  );
}
