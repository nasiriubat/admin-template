import type { ReactNode } from 'react';
import { CtaBand } from '@nexus/ui';
import { SiteChrome } from '../components/site-chrome';

/** Standard page frame: shared header/footer plus an optional closing CTA band. */
export function Page({ children, cta = true }: { children: ReactNode; cta?: boolean }) {
  return (
    <SiteChrome>
      {children}
      {cta && <CtaBand title="Build your next admin in an afternoon" description="Start with a design system that is already finished." primary={{ label: 'See pricing', href: '/pricing' }} secondary={{ label: 'Talk to us', href: '/contact' }} />}
    </SiteChrome>
  );
}
