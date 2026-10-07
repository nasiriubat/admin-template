'use client';

import { m, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';
import { BrowserFrame, Reveal } from '@nexus/ui/marketing';
import { overviewModule, zoomCaptions } from '../../content/product';
import { DashboardMock } from './dashboard-mock';
import { visibleBetween, zoomScale } from './scroll-math';
import { useScrollScene } from './use-scene-mode';

const WINDOWS: Array<[number, number]> = [
  [-1, 0.2],
  [0.2, 0.6],
  [0.6, 2],
];

function Caption({ p, index }: { p: MotionValue<number>; index: number }) {
  const [from, to] = WINDOWS[index]!;
  const opacity = useTransform(p, (v) => visibleBetween(v, from, to));
  const y = useTransform(opacity, [0, 1], [12, 0]);
  const c = zoomCaptions[index]!;
  return (
    <m.li style={{ opacity, y }} className="absolute inset-x-0 bottom-0 text-center">
      <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">{c.title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-text-muted">{c.body}</p>
    </m.li>
  );
}

function Pinned() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const scale = useTransform(scrollYProgress, zoomScale);
  return (
    <div ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center gap-8 px-6 pb-4 pt-20">
        <div className="w-full max-w-4xl overflow-hidden rounded-card">
          <BrowserFrame url="app.nexus.example/revenue" screenClassName="aspect-[16/9] overflow-hidden">
            <m.div style={{ scale, transformOrigin: '62% 58%' }} className="h-full will-change-transform">
              <DashboardMock data={overviewModule} className="h-full" />
            </m.div>
          </BrowserFrame>
        </div>
        <ol aria-label="Zoom story" className="relative h-28 w-full max-w-2xl">
          {zoomCaptions.map((c, i) => (
            <Caption key={c.title} p={scrollYProgress} index={i} />
          ))}
        </ol>
      </div>
    </div>
  );
}

function Static() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-16 md:px-6 md:py-24">
      <Reveal variant="scale">
        <BrowserFrame url="app.nexus.example/revenue" screenClassName="aspect-[16/11] sm:aspect-[16/9]">
          <DashboardMock data={overviewModule} className="h-full" />
        </BrowserFrame>
      </Reveal>
      <ol aria-label="Zoom story" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {zoomCaptions.map((c, i) => (
          <Reveal as="li" key={c.title} delay={i * 0.08} className="rounded-card border border-border bg-surface p-6 shadow-card">
            <h3 className="text-lg font-semibold">{c.title}</h3>
            <p className="mt-2 text-sm text-text-muted">{c.body}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

/**
 * Zoom story. On wide screens with motion allowed the stage is pinned with native `position: sticky`
 * and scroll progress scales the dashboard into one module and back out. Everywhere else (phones,
 * tablets, reduced motion) it is a normal static stack, so nothing hijacks scrolling.
 */
export function ZoomStory() {
  const scene = useScrollScene();
  return (
    <section id="story" aria-labelledby="story-title" className="scroll-mt-20">
      <div className="mx-auto max-w-2xl px-4 pt-16 text-center md:px-6 md:pt-24">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">The story</p>
        <h2 id="story-title" className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
          Zoom in on what matters
        </h2>
        <p className="mt-4 text-lg text-text-muted">Scroll to move from the whole workspace into a single module and back.</p>
      </div>
      {scene ? <Pinned /> : <Static />}
    </section>
  );
}
