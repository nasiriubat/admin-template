import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const isProd = process.env.NODE_ENV === 'production';

/**
 * Security headers that do not depend on a per-request value. The Content-Security-Policy
 * (which needs a nonce) is set in src/middleware.ts.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Self-contained server output for the Docker image; trace files from the monorepo root.
  output: 'standalone',
  outputFileTracingRoot: repoRoot,
  transpilePackages: [
    '@nexus/ui',
    '@nexus/theme',
    '@nexus/motion',
    '@nexus/config',
    '@nexus/auth',
    '@nexus/api-client',
    '@nexus/features',
  ],
  experimental: { optimizePackageImports: ['lucide-react', 'recharts', '@nexus/ui'] },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // The service worker must never be served from a stale HTTP cache.
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }, { key: 'Service-Worker-Allowed', value: '/' }] },
    ];
  },
};

export default nextConfig;
