import type { MarketingLink } from '@nexus/ui';

export const siteBrand = 'Nexus';
export const siteTagline = 'One design system for every admin and landing page you ship.';

/** Single source of truth for header and footer navigation across every marketing page. */
export const primaryLinks: MarketingLink[] = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Customers', href: '/customers' },
  { label: 'Docs', href: '/docs' },
  { label: 'Blog', href: '/blog' },
];

export const primaryCta: MarketingLink = { label: 'Start free', href: '/pricing' };
export const secondaryCta: MarketingLink = { label: 'Contact', href: '/contact' };

export const footerColumns: Array<{ title: string; links: MarketingLink[] }> = [
  { title: 'Templates', links: [{ label: 'SaaS', href: '/' }, { label: 'AI product', href: '/ai' }, { label: 'Enterprise', href: '/enterprise' }] },
  { title: 'Product', links: [{ label: 'Features', href: '/features' }, { label: 'Pricing', href: '/pricing' }, { label: 'Documentation', href: '/docs' }, { label: 'Changelog', href: '/changelog' }] },
  { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Customers', href: '/customers' }, { label: 'Blog', href: '/blog' }, { label: 'Contact', href: '/contact' }] },
  { title: 'Legal', links: [{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }] },
];

/** Every static route, used by the sitemap. */
export const staticRoutes = ['', '/ai', '/enterprise', '/pricing', '/features', '/about', '/contact', '/changelog', '/blog', '/docs', '/customers', '/privacy', '/terms'];
