import { PageHero } from '@nexus/ui';
import Link from 'next/link';
import { Page } from '../../components/page';
import { docPages } from '../../content/docs';
import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({ title: 'Documentation', description: 'Guides for installing, theming and extending Nexus.', path: '/docs' });

export default function DocsIndex() {
  return (
    <Page cta={false}>
      <PageHero eyebrow="Documentation" title="Learn Nexus" description="Short guides that take you from install to your first custom module." />
      <ul className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-3 md:px-6 md:py-16">
        {docPages.map((d) => (
          <li key={d.slug}>
            <Link href={`/docs/${d.slug}`} className="flex h-full flex-col rounded-card border border-border bg-surface p-6 shadow-card hover:border-primary">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">{d.group}</span>
              <span className="mt-2 text-lg font-semibold">{d.title}</span>
              <span className="mt-2 text-sm text-text-muted">{d.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
