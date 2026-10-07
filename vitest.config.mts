import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

const r = (p: string) => path.resolve(import.meta.dirname, p);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@nexus/theme': r('packages/theme/src'),
      '@nexus/ui': r('packages/ui/src'),
      '@nexus/config': r('packages/config/src'),
      '@nexus/motion': r('packages/motion/src'),
      '@nexus/auth': r('packages/auth/src'),
      '@nexus/api-client': r('packages/api-client/src'),
      '@nexus/features': r('features'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [r('tests/setup.ts')],
    include: ['packages/**/*.test.{ts,tsx}', 'features/**/*.test.{ts,tsx}', 'apps/**/*.test.{ts,tsx}', 'tests/unit/**/*.test.{ts,tsx}'],
    css: false,
  },
});
