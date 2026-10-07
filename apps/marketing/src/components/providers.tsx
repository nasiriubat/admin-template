'use client';

import { domAnimation, LazyMotion, MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@nexus/theme';

/**
 * LazyMotion + `m` components load only the DOM-animation feature set (about half the size of the
 * full framer-motion bundle). Marketing animation never needs drag or layout animations.
 */
export function MarketingProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LazyMotion features={domAnimation}>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  );
}
