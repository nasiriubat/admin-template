import type { Metadata } from 'next';

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3200';
export const siteName = 'Nexus';
export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@example.com';

/** Metadata with canonical URL and Open Graph/Twitter tags. `path` is the route, e.g. `/pricing`. */
export function pageMetadata({ title, description, path, type = 'website' }: { title: string; description: string; path: string; type?: 'website' | 'article' }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type, siteName },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/** Serialises JSON-LD safely for use inside a script tag. */
export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
