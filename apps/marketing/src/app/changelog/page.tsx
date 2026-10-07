import { PageHero, ReleaseTimeline } from '@nexus/ui';
import { Page } from '../../components/page';
import { releases } from '../../content/changelog';
import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({ title: 'Changelog', description: 'Every release: what was added, changed and fixed.', path: '/changelog' });

export default function ChangelogPage() {
  return (
    <Page cta={false}>
      <PageHero eyebrow="Changelog" title="What is new" description="Release notes for every version, newest first." />
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <ReleaseTimeline releases={releases} />
      </div>
    </Page>
  );
}
