import type { MetadataRoute } from 'next';
import { docPages } from '../content/docs';
import { posts } from '../content/posts';
import { siteUrl } from '../lib/seo';
import { staticRoutes } from '../lib/nav';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...staticRoutes, ...docPages.map((d) => `/docs/${d.slug}`), ...posts.map((p) => `/blog/${p.slug}`)];
  return paths.map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: path.startsWith('/blog') || path === '/changelog' ? 'weekly' : 'monthly', priority: path === '' ? 1 : 0.7 }));
}
