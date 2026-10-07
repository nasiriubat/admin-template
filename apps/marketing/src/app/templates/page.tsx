import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@nexus/ui/marketing';
import { SiteChrome } from '../../components/site-chrome';
import { TemplatePreview } from '../../components/template-preview';
import { templates } from '../../lib/templates';

export const metadata: Metadata = {
  title: 'Landing page templates',
  description: 'Five complete, animated landing page templates. Pick the one that fits your product.',
  alternates: { canonical: '/templates' },
};

export default function TemplatesPage() {
  return (
    <SiteChrome>
      <PageHero eyebrow="Templates" title="Five landing pages, one design system" description="Every template shares the same tokens, components and accessibility rules, so you can switch the look without rebuilding anything." />
      <section aria-label="Templates" className="mx-auto max-w-6xl px-4 pb-24 md:px-6">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <li key={t.id}>
              <Link href={t.path} className="group block overflow-hidden rounded-card border border-border bg-surface transition-shadow hover:shadow-popover">
                <span className="block aspect-[4/3] overflow-hidden bg-canvas transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none">
                  <TemplatePreview template={t} />
                </span>
                <span className="block border-t border-border p-5">
                  <span className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{t.name}</span>
                    <span className="text-xs font-medium text-primary">Open →</span>
                  </span>
                  <span className="mt-1 block text-sm text-text-muted">{t.tagline}</span>
                  <span className="mt-3 inline-block rounded-full border border-border px-2.5 py-0.5 text-xs text-text-muted">Best for {t.bestFor.toLowerCase()}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </SiteChrome>
  );
}
