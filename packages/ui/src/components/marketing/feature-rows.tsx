import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';

export interface FeatureRowItem {
  id?: string;
  icon: string;
  eyebrow?: string;
  title: string;
  description: string;
  bullets?: string[];
  visual: ReactNode;
}

/** Alternating text / visual rows. On small screens the text always comes first. */
export function FeatureRows({ items }: { items: FeatureRowItem[] }) {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-16 md:space-y-24 md:px-6 md:py-24">
      {items.map((item, i) => (
        <section key={item.title} id={item.id} aria-labelledby={`${item.id ?? `row-${i}`}-title`} className="grid scroll-mt-24 items-center gap-8 md:grid-cols-2 md:gap-14">
          <div className={cn(i % 2 === 1 && 'md:order-2')}>
            <span className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <IconRenderer name={item.icon} className="size-5" />
            </span>
            {item.eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-primary">{item.eyebrow}</p>}
            <h2 id={`${item.id ?? `row-${i}`}-title`} className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              {item.title}
            </h2>
            <p className="mt-4 text-lg text-text-muted">{item.description}</p>
            {item.bullets && (
              <ul className="mt-6 space-y-2.5">
                {item.bullets.map((b) => (
                  <li key={b} className="flex gap-2.5 text-sm">
                    <IconRenderer name="Check" className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={cn(i % 2 === 1 && 'md:order-1')}>{item.visual}</div>
        </section>
      ))}
    </div>
  );
}
