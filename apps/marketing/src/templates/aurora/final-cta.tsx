import Link from 'next/link';
import { Button, FloatingShapes, MagneticButton, Reveal, Squiggle } from '@nexus/ui/marketing';
import { Band } from './band';

export function AuroraCta() {
  return (
    <Band tone="primary" next="surface" wave="smooth" labelledBy="cta-title" className="text-primary-foreground">
      <FloatingShapes count={9} tones={['canvas', 'accent']} seed={5} />
      <Reveal className="relative mx-auto max-w-3xl px-4 pb-10 pt-20 text-center md:px-6 md:pt-28">
        <h2 id="cta-title" className="text-4xl font-semibold tracking-tight md:text-6xl">
          Build your next admin in{' '}
          <Squiggle tone="canvas">
            <span>an afternoon</span>
          </Squiggle>
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-lg opacity-90">Start with a design system that is already finished.</p>
        <div className="mt-8 flex justify-center">
          <MagneticButton>
            <Button size="lg" variant="secondary" asChild className="rounded-full px-8">
              <Link href="#pricing">Start free</Link>
            </Button>
          </MagneticButton>
        </div>
      </Reveal>
    </Band>
  );
}
