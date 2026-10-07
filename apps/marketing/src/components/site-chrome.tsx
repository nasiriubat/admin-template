'use client';

import type { ReactNode } from 'react';
import { IconButton, IconRenderer, MarketingFooter, MarketingNav, type MarketingLink } from '@nexus/ui';
import { useTheme } from '@nexus/theme';

const footerColumns = [
  { title: 'Templates', links: [{ label: 'SaaS', href: '/' }, { label: 'AI product', href: '/ai' }, { label: 'Enterprise', href: '/enterprise' }] },
  { title: 'Product', links: [{ label: 'Admin dashboard', href: '#' }, { label: 'Documentation', href: '#' }, { label: 'Changelog', href: '#' }] },
  { title: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Contact', href: '#' }, { label: 'Privacy', href: '#' }] },
];

function ThemeToggle() {
  const { resolvedMode, toggleMode } = useTheme();
  return (
    <IconButton label={`Switch to ${resolvedMode === 'dark' ? 'light' : 'dark'} mode`} onClick={toggleMode} className="fixed bottom-4 right-4 z-30 border border-border bg-surface shadow-popover">
      <IconRenderer name={resolvedMode === 'dark' ? 'Sun' : 'Moon'} className="size-5" />
    </IconButton>
  );
}

export function SiteChrome({ children, brand, tagline, links, cta, secondaryCta }: { children: ReactNode; brand: string; tagline: string; links: MarketingLink[]; cta: MarketingLink; secondaryCta?: MarketingLink }) {
  return (
    <>
      <MarketingNav brand={brand} links={links} cta={cta} secondaryCta={secondaryCta} />
      <main id="content">{children}</main>
      <MarketingFooter brand={brand} tagline={tagline} columns={footerColumns} />
      <ThemeToggle />
    </>
  );
}
