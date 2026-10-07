import { Alert, Button, Faq, PageHero, PricingPlans, SectionShell } from '@nexus/ui';
import Link from 'next/link';
import { Page } from '../../components/page';
import { matrix, plans, pricingFaq } from '../../content/pricing';
import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({ title: 'Pricing', description: 'Simple plans for every stage, with yearly savings and a full feature comparison.', path: '/pricing' });

export default function PricingPage() {
  return (
    <Page cta={false}>
      <PageHero eyebrow="Pricing" title="Simple pricing that grows with your product" description="Start free, upgrade when you need more modules, support or white-label rights." />
      <PricingPlans plans={plans} groups={matrix} />
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <Alert variant="success" title="30-day money-back guarantee">
          Not the right fit? Tell us within 30 days of purchase and we will refund your first payment, no questions asked.
        </Alert>
      </div>
      <Faq id="faq" title="Pricing questions" items={pricingFaq} />
      <SectionShell title="Need something custom?" description="Security reviews, single sign-on and service agreements are handled by our team.">
        <div className="flex justify-center">
          <Button size="lg" asChild>
            <Link href="/contact">Contact sales</Link>
          </Button>
        </div>
      </SectionShell>
    </Page>
  );
}
