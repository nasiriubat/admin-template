import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar, Badge, ContentBlocks, ScrollProgress } from '@nexus/ui/marketing';
import { Page } from '../../../components/page';
import { posts } from '../../../content/posts';
import { readingTime } from '../../../lib/blog';
import { formatDate } from '../../../lib/format';
import { jsonLd, pageMetadata, siteName, siteUrl } from '../../../lib/seo';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return posts.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return { ...pageMetadata({ title: post.title, description: post.description, path: `/blog/${post.slug}`, type: 'article' }), authors: [{ name: post.author }] };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: siteName },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };
  return (
    <Page cta={false}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />
      <ScrollProgress />
      <article className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <Link href="/blog" className="inline-flex min-h-11 items-center text-sm text-text-muted hover:text-text">
          ← All posts
        </Link>
        <header className="mb-10 mt-4 border-b border-border pb-8">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Badge key={t} variant="primary">
                {t}
              </Badge>
            ))}
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-text-muted">{post.description}</p>
          <div className="mt-6 flex items-center gap-3 text-sm">
            <Avatar name={post.author} />
            <span>
              <span className="block font-medium">{post.author}</span>
              <span className="text-text-muted">
                <time dateTime={post.date}>{formatDate(post.date)}</time> · {readingTime(post.blocks)} min read
              </span>
            </span>
          </div>
        </header>
        <ContentBlocks blocks={post.blocks} />
      </article>
    </Page>
  );
}
