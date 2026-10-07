'use client';

import type { ReactNode } from 'react';
import { IconButton, IconRenderer, MarketingFooter, MarketingNav, type MarketingLink } from '@nexus/ui';
import { useTheme } from '@nexus/theme';
import { footerColumns, primaryCta, primaryLinks, secondaryCta as defaultSecondary, siteBrand, siteTagline } from '../lib/nav';

function ThemeToggle() {
  const { resolvedMode, toggleMode } = useTheme();
  return (
    <IconButton label={`Switch to ${resolvedMode === 'dark' ? 'light' : 'dark'} mode`} onClick={toggleMode} className="fixed bottom-4 right-4 z-30 border border-border bg-surface shadow-popover">
      <IconRenderer name={resolvedMode === 'dark' ? 'Sun' : 'Moon'} className="size-5" />
    </IconButton>
  );
}

/**
 * Shared header, footer and theme toggle. Every page uses the shared nav config by default; the
 * landing templates pass in-page anchor links instead.
 */
export function SiteChrome({ children, brand = siteBrand, tagline = siteTagline, links = primaryLinks, cta = primaryCta, secondaryCta = defaultSecondary }: { children: ReactNode; brand?: string; tagline?: string; links?: MarketingLink[]; cta?: MarketingLink; secondaryCta?: MarketingLink }) {
  return (
    <>
      <MarketingNav brand={brand} links={links} cta={cta} secondaryCta={secondaryCta} />
      <main id="content">{children}</main>
      <MarketingFooter brand={brand} tagline={tagline} columns={footerColumns} />
      <ThemeToggle />
    </>
  );
}
