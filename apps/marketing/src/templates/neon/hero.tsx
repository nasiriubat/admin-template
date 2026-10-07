import Link from 'next/link';
import { Button, GridBackground, MagneticButton, Orbs, Reveal, RotatingWords, Typewriter, cn } from '@nexus/ui/marketing';
import { ChatDemo } from './chat-demo';
import { neon } from './neon';

export function NeonHero({ words }: { words: string[] }) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-x-clip">
      <div aria-hidden="true" className="absolute inset-0 opacity-20">
        <GridBackground size={56} />
      </div>
      <Orbs tones={['primary', 'accent', 'info']} intensity="medium" />
      <div className="relative mx-auto grid grid-cols-1 max-w-6xl items-center gap-12 px-4 pb-20 pt-14 md:px-6 md:pb-28 md:pt-24 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div className="text-center lg:text-left">
          <Reveal direction="down" distance={10}>
            <p className={cn('inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs sm:text-sm', neon.panel)}>
              <span aria-hidden="true" className="size-2 rounded-full bg-success" />
              Connected to{' '}
              <Typewriter text={['your wikis', 'your tickets', 'your code', 'your databases']} speed={60} hold={1400} className="font-semibold" />
            </p>
          </Reveal>
          <h1 id="hero-title" className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            Answers your team can{' '}
            <RotatingWords words={words} className="rounded-2xl bg-primary px-3 pb-1" wordClassName="text-primary-foreground" />
          </h1>
          <Reveal delay={0.15}>
            <p className={cn('mx-auto mt-6 max-w-xl text-lg lg:mx-0 md:text-xl', neon.muted)}>
              Connect your knowledge, version your prompts and measure quality continuously, without stitching together five tools.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <MagneticButton>
              <Button size="lg" asChild className="px-8 shadow-[0_0_28px_-4px_rgb(var(--primary-rgb)/0.8)]">
                <Link href="#pricing">Request access</Link>
              </Button>
            </MagneticButton>
            <Button size="lg" variant="secondary" asChild>
              <Link href="#pipeline">See the pipeline</Link>
            </Button>
          </Reveal>
        </div>
        <Reveal direction="left" distance={40} delay={0.2}>
          <ChatDemo />
        </Reveal>
      </div>
    </section>
  );
}
