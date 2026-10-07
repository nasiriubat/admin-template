import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nexus',
    short_name: 'Nexus',
    description: 'Ship a polished admin and a landing page from one design system.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#564fde',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
