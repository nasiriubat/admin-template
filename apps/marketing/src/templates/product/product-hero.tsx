'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { BrowserFrame, Badge, Button, Float, GradientMesh, IconRenderer, Orbs, Reveal, WaveDivider, usePrefersReducedMotion } from '@nexus/ui/marketing';
import { overviewModule } from '../../content/product';
import { DashboardMock } from './dashboard-mock';
import { heroFrame } from './scroll-math';

function Chip({ icon, text, className, delay }: { icon: string; text: string; className: string; delay: number }) {
  return (
    <Float aria-hidden="true" amplitude={10} duration={6} delay={delay} className={`absolute z-10 hidden items-center gap-2 rounded-full border border-border bg-surface-elevated px-3.5 py-2 text-sm font-medium shadow-popover md:flex ${className}`}>
      <IconRenderer name={icon} className="size-4 text-primary" />
      {text}
    </Float>
  );
}

/** Keynote-style opener: centred headline, then a browser mock that rises, flattens and scales up as you scroll. */
export function ProductHero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 25%'] });
  const rotateX = useTransform(scrollYProgress, (p) => heroFrame(p).rotateX);
  const scale = useTransform(scrollYProgress, (p) => heroFrame(p).scale);
  const y = useTransform(scrollYProgress, (p) => heroFrame(p).y);

  return (
    <section className="relative isolate overflow-hidden">
      <GradientMesh tones={['primary', 'accent', 'info']} intensity="subtle" className="-z-10" />
      <Orbs tones={['primary', 'secondary']} intensity="subtle" className="-z-10" />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center md:px-6 md:pb-24 md:pt-28">
        <Reveal direction="down" distance={12}>
          <Badge variant="primary" className="mb-6">
            New: the Workflows module
          </Badge>
        </Reveal>
        <Reveal variant="blur" delay={0.05}>
          <h1 className="mx-auto max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            One workspace. <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Every screen.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-muted md:text-2xl">A calm, themeable admin that feels native on a laptop and on a phone, ready the day you start.</p>
        </Reveal>
        <Reveal delay={0.25} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="#pricing">Start free</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="#story">Watch the story</Link>
          </Button>
        </Reveal>

        <div ref={ref} className="relative mx-auto mt-14 max-w-5xl md:mt-20" style={{ perspective: 1400 }}>
          <Chip icon="TrendingUp" text="Revenue up 12%" className="-left-6 top-10" delay={0} />
          <Chip icon="ShieldCheck" text="Audit trail on" className="-right-6 top-1/3" delay={-2} />
          <Chip icon="Smartphone" text="Installable PWA" className="-left-2 bottom-12" delay={-4} />
          <motion.div style={reduced ? undefined : { rotateX, scale, y, transformOrigin: '50% 100%' }} className="will-change-transform">
            <BrowserFrame url="app.nexus.example/overview" screenClassName="aspect-[16/11] sm:aspect-[16/10]">
              <DashboardMock data={overviewModule} className="h-full" />
            </BrowserFrame>
          </motion.div>
        </div>
      </div>
      <WaveDivider variant="smooth" fill="canvas" className="absolute inset-x-0 bottom-0 -z-10" heightClass="h-8 md:h-14" />
    </section>
  );
}
