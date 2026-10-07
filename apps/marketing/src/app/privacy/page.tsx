import { ContentBlocks, GradientMesh, Reveal, ScrollProgress, TemplateBanner } from '@nexus/ui/marketing';
import { Page } from '../../components/page';
import { privacy } from '../../content/legal';
import { formatDate } from '../../lib/format';
import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({ title: privacy.title, description: privacy.description, path: '/privacy' });

export default function PrivacyPage() {
  return (
    <Page cta={false}>
      <ScrollProgress />
      <div className="relative isolate overflow-hidden">
        <GradientMesh intensity="subtle" className="-z-10 h-80" />
      <article className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <TemplateBanner />
        <Reveal>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight">{privacy.title}</h1>
          <p className="mb-8 mt-3 text-sm text-text-muted">
            Last updated: <time dateTime={privacy.updated}>{formatDate(privacy.updated)}</time>
          </p>
        </Reveal>
        <ContentBlocks blocks={privacy.blocks} />
      </article>
      </div>
    </Page>
  );
}
