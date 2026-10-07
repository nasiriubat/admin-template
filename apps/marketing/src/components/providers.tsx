'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@nexus/theme';

export function MarketingProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}
