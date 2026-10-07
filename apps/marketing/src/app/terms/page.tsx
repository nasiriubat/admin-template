import { ContentBlocks, TemplateBanner } from '@nexus/ui';
import { Page } from '../../components/page';
import { terms } from '../../content/legal';
import { formatDate } from '../../lib/format';
import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({ title: terms.title, description: terms.description, path: '/terms' });

export default function TermsPage() {
  return (
    <Page cta={false}>
      <article className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <TemplateBanner />
        <h1 className="mt-8 text-4xl font-semibold tracking-tight">{terms.title}</h1>
        <p className="mb-8 mt-3 text-sm text-text-muted">
          Last updated: <time dateTime={terms.updated}>{formatDate(terms.updated)}</time>
        </p>
        <ContentBlocks blocks={terms.blocks} />
      </article>
    </Page>
  );
}
