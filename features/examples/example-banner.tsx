'use client';

import { Banner } from '@nexus/ui';

/** Shown at the top of every example page so nobody ships the demos by accident. */
export function ExampleBanner() {
  return (
    <Banner variant="info" title="Example page - remove features/examples before shipping">
      See docs/EXAMPLES.md for how to remove or disable this module.
    </Banner>
  );
}
