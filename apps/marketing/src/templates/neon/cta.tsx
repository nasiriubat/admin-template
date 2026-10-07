import Link from 'next/link';
import { Button, GlowBorder, GridBackground, MagneticButton, Orbs, Reveal, cn } from '@nexus/ui/marketing';
import { neon } from './neon';

export function NeonCta() {
  return (
    <section aria-labelledby="cta-title" className="relative mx-auto max-w-5xl px-4 pb-20 md:px-6 md:pb-28">
      <Reveal>
        <GlowBorder className="rounded-[2rem] shadow-popover" innerClassName="rounded-[calc(2rem-2px)] bg-secondary" thickness={2}>
          <div className="relative isolate overflow-hidden px-6 py-16 text-center md:px-12 md:py-20">
            <div aria-hidden="true" className="absolute inset-0 opacity-20">
              <GridBackground size={40} />
            </div>
            <Orbs tones={['primary', 'accent']} intensity="medium" />
            <h2 id="cta-title" className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
              Put trustworthy answers in front of your users
            </h2>
            <p className={cn('relative mx-auto mt-4 max-w-xl text-lg', neon.muted)}>Join the early access program.</p>
            <div className="relative mt-8 flex justify-center">
              <MagneticButton>
                <Button size="lg" asChild className="px-8 shadow-[0_0_28px_-4px_rgb(var(--primary-rgb)/0.8)]">
                  <Link href="#pricing">Request access</Link>
                </Button>
              </MagneticButton>
            </div>
          </div>
        </GlowBorder>
      </Reveal>
    </section>
  );
}
