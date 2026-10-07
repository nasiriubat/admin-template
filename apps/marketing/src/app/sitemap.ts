import type { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3200';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/ai', '/enterprise'].map((path) => ({ url: `${base}${path}`, changeFrequency: 'monthly', priority: path === '' ? 1 : 0.7 }));
}
