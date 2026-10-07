import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentBlocks, DocsLayout, ScrollProgress, extractHeadings } from '@nexus/ui/marketing';
import { SiteChrome } from '../../../components/site-chrome';
import { docPages, docsNav } from '../../../content/docs';
import { pageMetadata } from '../../../lib/seo';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return docPages.map((d) => ({ slug: d.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = docPages.find((d) => d.slug === slug);
  return doc ? pageMetadata({ title: `${doc.title} · Docs`, description: doc.description, path: `/docs/${doc.slug}` }) : {};
}

export default async function DocPageRoute({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const index = docPages.findIndex((d) => d.slug === slug);
  if (index < 0) notFound();
  const doc = docPages[index];
  const link = (d?: (typeof docPages)[number]) => (d ? { title: d.title, href: `/docs/${d.slug}` } : undefined);
  return (
    <SiteChrome>
      <ScrollProgress />
      <DocsLayout groups={docsNav} current={`/docs/${doc.slug}`} toc={extractHeadings(doc.blocks)} prev={link(docPages[index - 1])} next={link(docPages[index + 1])}>
        <article>
          <p className="text-sm font-semibold text-primary">{doc.group}</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight">{doc.title}</h1>
          <p className="mb-8 mt-3 text-lg text-text-muted">{doc.description}</p>
          <ContentBlocks blocks={doc.blocks} />
        </article>
      </DocsLayout>
    </SiteChrome>
  );
}
