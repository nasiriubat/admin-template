'use client';

import { useEffect, useState } from 'react';
import { cn } from '../../../lib/utils';
import { canObserve } from './shared';

export interface SectionNavItem {
  id: string;
  label: string;
}

export interface SectionNavProps {
  sections: SectionNavItem[];
  /** Accessible name of the navigation landmark. */
  label?: string;
  side?: 'left' | 'right';
  className?: string;
}

/** Optional fixed dot navigation that highlights the section in view. Visible from lg up; links are real anchors. */
export function SectionNav({ sections, label = 'Page sections', side = 'right', className }: SectionNavProps) {
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    if (!canObserve()) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.5, 1] },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav aria-label={label} className={cn('fixed top-1/2 z-40 hidden -translate-y-1/2 lg:block', side === 'right' ? 'right-4' : 'left-4', className)}>
      <ul className="flex flex-col items-center">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-label={s.label}
              aria-current={active === s.id ? 'location' : undefined}
              title={s.label}
              className="group flex size-6 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className={cn('block rounded-full transition-all motion-reduce:transition-none', active === s.id ? 'size-3 bg-primary' : 'size-2 bg-border-strong group-hover:bg-text-muted')} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
