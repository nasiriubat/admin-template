import Link from 'next/link';
import { Button, CurvedSection, DotPattern, Orbs, Reveal } from '@nexus/ui/marketing';

/** Full-bleed primary closing section with a domed top edge. */
export function ClosingCta() {
  return (
    <CurvedSection id="contact" tone="primary" outerTone="canvas" curve="top" className="text-primary-foreground" contentClassName="px-4 pb-20 md:px-6 md:pb-28">
      <Orbs tones={['accent', 'info', 'secondary']} intensity="subtle" />
      <DotPattern className="opacity-20" />
      <Reveal className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-balance md:text-6xl">See it with your own data</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg opacity-90 md:text-xl">We will tailor a walkthrough to your workflows and invite your security team to the second call.</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" variant="secondary" asChild><Link href="mailto:sales@example.com">Book a demo</Link></Button>
          <Button size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild><Link href="#platform">Review the platform</Link></Button>
        </div>
      </Reveal>
    </CurvedSection>
  );
}
