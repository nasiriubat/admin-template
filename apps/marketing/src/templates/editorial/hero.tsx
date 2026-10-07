import Link from 'next/link';
import { Badge, Button, DotPattern, IconRenderer, Orbs, Reveal, WaveDivider } from '@nexus/ui/marketing';
import { LineageIllustration } from './lineage-illustration';

export interface EditorialHeroProps {
  proof: string[];
}

/** Calm, spacious opening: large type on the left, a parallax lineage illustration on the right. */
export function EditorialHero({ proof }: EditorialHeroProps) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-canvas">
      <Orbs tones={['info', 'primary', 'success']} intensity="subtle" />
      <DotPattern className="opacity-60" />
      <div className="mx-auto grid grid-cols-1 max-w-6xl items-center gap-12 px-4 pb-24 pt-14 md:px-6 md:pb-36 md:pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <Reveal>
            <Badge variant="info" dot>For research and regulated teams</Badge>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 id="hero-title" className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Reproducible research, <span className="text-primary">governed end to end.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-lg text-text-muted md:text-xl">
              Versioned data, auditable access and repeatable analysis in one platform that your researchers enjoy and your security team can approve.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild><Link href="#contact">Book a demo</Link></Button>
            <Button size="lg" variant="secondary" asChild><Link href="#lineage">See how lineage works</Link></Button>
          </Reveal>
          <Reveal as="ul" delay={0.32} className="mt-10 space-y-3 text-sm text-text-muted">
            {proof.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                  <IconRenderer name="Check" className="size-3.5" />
                </span>
                {p}
              </li>
            ))}
          </Reveal>
        </div>
        <Reveal variant="fade" direction="none" delay={0.2} duration={0.9}>
          <LineageIllustration />
        </Reveal>
      </div>
      <WaveDivider variant="layered" fill="surface" className="absolute inset-x-0 bottom-0" heightClass="h-14 md:h-24" />
    </section>
  );
}
