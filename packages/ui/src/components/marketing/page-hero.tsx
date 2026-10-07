import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { FloatingShapes } from './motion/floating-shapes';
import { GradientMesh, Orbs } from './motion/backgrounds';
import { Reveal } from './motion/reveal';
import { WaveDivider } from './motion/wave-divider';

/**
 * Compact hero for inner pages (pricing, about, docs...). Use `Hero` for landing pages with a visual.
 * The backdrop (gradient mesh, orbs, floating shapes, wave edge) is decorative: aria-hidden, static
 * under reduced motion, and the heading/description are plain text that is visible without animation.
 */
export function PageHero({ eyebrow, title, description, children, align = 'center', className }: { eyebrow?: string; title: string; description?: string; children?: ReactNode; align?: 'center' | 'left'; className?: string }) {
  return (
    <section className="relative isolate overflow-hidden">
      <GradientMesh tones={['primary', 'accent', 'info']} intensity="subtle" className="-z-10" />
      <Orbs tones={['primary', 'accent']} intensity="subtle" className="-z-10" />
      <FloatingShapes count={6} seed={7} className="-z-10 hidden sm:block" />
      <div className={cn('mx-auto max-w-6xl px-4 pb-20 pt-14 md:px-6 md:pb-28 md:pt-20', align === 'center' && 'text-center', className)}>
        {eyebrow && (
          <Reveal direction="down" distance={12}>
            <Badge variant="primary" className="mb-5">
              {eyebrow}
            </Badge>
          </Reveal>
        )}
        <Reveal delay={0.05}>
          <h1 className={cn('max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl', align === 'center' && 'mx-auto')}>{title}</h1>
        </Reveal>
        {description && (
          <Reveal delay={0.15}>
            <p className={cn('mt-5 max-w-2xl text-lg text-text-muted', align === 'center' && 'mx-auto')}>{description}</p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={0.25} className={cn('mt-8 flex flex-wrap gap-3', align === 'center' && 'justify-center')}>
            {children}
          </Reveal>
        )}
      </div>
      <WaveDivider variant="layered" fill="canvas" className="absolute inset-x-0 bottom-0 -z-10" heightClass="h-8 md:h-14" />
    </section>
  );
}
