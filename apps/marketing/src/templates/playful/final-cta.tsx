import Link from 'next/link';
import { Button, FloatingShapes, MagneticButton, Reveal, Sparkles } from '@nexus/ui/marketing';

/** Closing call to action on a solid primary band, with confetti-like floating shapes. */
export function FinalCta() {
  return (
    <section id="join" aria-labelledby="join-title" className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <FloatingShapes count={16} seed={31} tones={['warning', 'danger', 'accent', 'success', 'info']} kinds={['circle', 'star', 'plus', 'ring', 'triangle']} />
      <Reveal className="relative mx-auto max-w-3xl px-4 pb-24 pt-10 text-center md:px-6 md:pb-32">
        <h2 id="join-title" className="text-4xl font-extrabold tracking-tight text-balance md:text-6xl">
          Your first <Sparkles tone="warning" count={4}>win</Sparkles> is two minutes away
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg opacity-95 md:text-xl">Make a circle, invite someone you like, and tick off today.</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MagneticButton>
            <Button size="lg" variant="secondary" className="min-h-12 rounded-full px-8 text-base font-bold" asChild><Link href="/contact">Create my circle</Link></Button>
          </MagneticButton>
          <Button size="lg" variant="ghost" className="min-h-12 rounded-full px-6 font-bold text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild><Link href="#pricing">Compare plans</Link></Button>
        </div>
      </Reveal>
    </section>
  );
}
