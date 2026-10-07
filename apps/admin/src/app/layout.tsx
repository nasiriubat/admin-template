import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { defaultPresets, generateThemeCss, getThemeInitScript } from '@nexus/theme';
import { Providers } from '../components/providers';
import { PwaRegister } from './pwa-register';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Nexus Admin', template: '%s · Nexus Admin' },
  description: 'Reusable, themeable admin dashboard framework.',
  manifest: '/manifest.webmanifest',
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Nexus Admin' },
  icons: { icon: '/icons/icon.svg', apple: '/icons/icon-192.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f19' },
  ],
};

const themeCss = generateThemeCss(defaultPresets);
const themeInit = getThemeInitScript(defaultPresets);

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Resolve the stored theme before first paint so there is no light/dark or preset flash. */}
        <style nonce={nonce} dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <Providers>
          <PwaRegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}
