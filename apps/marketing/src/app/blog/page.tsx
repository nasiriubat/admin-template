import { Avatar, Badge, PageHero, Reveal } from '@nexus/ui/marketing';
import Link from 'next/link';
import { Page } from '../../components/page';
import { posts } from '../../content/posts';
import { readingTime, sortByDateDesc, uniqueTags } from '../../lib/blog';
import { formatDate } from '../../lib/format';
import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({ title: 'Blog', description: 'Notes on design systems, accessibility, security and building admin products.', path: '/blog' });

export default function BlogPage() {
  const sorted = sortByDateDesc(posts);
  return (
    <Page cta={false}>
      <PageHero eyebrow="Blog" title="Notes from the team" description="Practical writing on interface design, accessibility and security.">
        <ul aria-label="Topics" className="flex flex-wrap justify-center gap-2">
          {uniqueTags(posts).map((t) => (
            <li key={t}>
              <Badge variant="neutral">{t}</Badge>
            </li>
          ))}
        </ul>
      </PageHero>
      <ul className="mx-auto grid grid-cols-1 max-w-6xl gap-4 px-4 py-12 md:grid-cols-2 md:px-6 md:py-16 lg:grid-cols-3">
        {sorted.map((p, i) => (
          <Reveal as="li" key={p.slug} delay={(i % 3) * 0.08}>
            <article className="relative flex h-full flex-col rounded-card border border-border bg-surface p-6 shadow-card focus-within:ring-2 focus-within:ring-primary transition-transform duration-300 hover:-translate-y-1 hover:border-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <div className="flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <Badge key={t} variant="primary">
                    {t}
                  </Badge>
                ))}
              </div>
              <h2 className="mt-4 text-xl font-semibold leading-snug">
                <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-2 flex-1 text-sm text-text-muted">{p.description}</p>
              <div className="mt-6 flex items-center gap-3 text-sm">
                <Avatar name={p.author} size="sm" />
                <span>
                  <span className="block font-medium">{p.author}</span>
                  <span className="text-text-muted">
                    <time dateTime={p.date}>{formatDate(p.date)}</time> · {readingTime(p.blocks)} min read
                  </span>
                </span>
              </div>
            </article>
          </Reveal>
        ))}
      </ul>
    </Page>
  );
}
