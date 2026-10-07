import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { defaultPresets, generateThemeCss, getThemeInitScript } from '@nexus/theme';
import { MarketingProviders } from '../components/providers';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3200';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Nexus', template: '%s · Nexus' },
  description: 'Ship a polished admin and a landing page from one design system.',
  icons: { icon: '/icons/icon.svg', apple: '/icons/apple-touch-icon.png' },
  openGraph: { type: 'website', siteName: 'Nexus' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f19' },
  ],
};

const themeCss = generateThemeCss(defaultPresets);
const themeInit = getThemeInitScript(defaultPresets);

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <a href="#content" className="sr-only z-[100] rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
          Skip to content
        </a>
        <MarketingProviders>{children}</MarketingProviders>
      </body>
    </html>
  );
}
