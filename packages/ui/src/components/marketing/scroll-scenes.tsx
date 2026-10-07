'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';
import { SectionShell } from './marketing-nav';

/**
 * GSAP + ScrollTrigger are loaded on demand and only when the user has not asked for reduced
 * motion and the viewport is wide enough. Otherwise both scenes degrade to plain, fully readable
 * static layouts (docs/MOTION.md: never trade usability for animation).
 */
async function loadGsap() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}

const canAnimate = () =>
  typeof window !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  window.matchMedia('(min-width: 1024px)').matches;

export interface ShowcaseStep {
  icon: string;
  title: string;
  description: string;
  visual: ReactNode;
}

/** Sticky Feature Showcase: copy scrolls while the product visual stays pinned and swaps. */
export function StickyShowcase({ id, eyebrow, title, description, steps }: { id?: string; eyebrow?: string; title: string; description?: string; steps: ShowcaseStep[] }) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !canAnimate()) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        el.querySelectorAll<HTMLElement>('[data-step]').forEach((node, i) => {
          ScrollTrigger.create({ trigger: node, start: 'top 55%', end: 'bottom 45%', onToggle: (self) => self.isActive && setActive(i) });
        });
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <SectionShell id={id} eyebrow={eyebrow} title={title} description={description}>
      <div ref={root} className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ol className="space-y-6 lg:space-y-[26vh] lg:pb-[20vh]">
          {steps.map((s, i) => (
            <li key={s.title} data-step className={cn('rounded-card border bg-surface p-6 shadow-card transition-opacity duration-300 lg:min-h-48', i === active ? 'border-primary lg:opacity-100' : 'border-border lg:opacity-60')}>
              <span className="mb-4 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <IconRenderer name={s.icon} className="size-5" />
              </span>
              <h3 className="text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-text-muted">{s.description}</p>
              <div className="mt-5 lg:hidden">{s.visual}</div>
            </li>
          ))}
        </ol>
        <div className="hidden lg:block">
          <div className="sticky top-28 rounded-card border border-border bg-surface p-6 shadow-card" aria-live="polite">
            {steps[active].visual}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export interface ExplodedLayer {
  label: string;
  description: string;
  icon: string;
}

/** Exploded view: layers of a system separate on scroll and reconnect. Static stack without motion. */
export function ExplodedView({ id, eyebrow, title, description, layers }: { id?: string; eyebrow?: string; title: string; description?: string; layers: ExplodedLayer[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !canAnimate()) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const items = gsap.utils.toArray<HTMLElement>('[data-layer]');
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 20%', end: '+=120%', scrub: 0.6, pin: true } });
        items.forEach((item, i) => {
          tl.to(item, { y: (i - (items.length - 1) / 2) * 56, ease: 'power2.out' }, 0);
        });
        tl.to(items, { y: 0, ease: 'power2.inOut', duration: 0.6 }, '+=0.3');
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <SectionShell id={id} eyebrow={eyebrow} title={title} description={description}>
      <div ref={root} className="mx-auto max-w-3xl">
        <ol className="relative space-y-3">
          {layers.map((layer, i) => (
            <li key={layer.label} data-layer className="relative flex items-center gap-4 rounded-card border border-border bg-surface p-5 shadow-card" style={{ zIndex: layers.length - i }}>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <IconRenderer name={layer.icon} className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{layer.label}</h3>
                <p className="text-sm text-text-muted">{layer.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}
