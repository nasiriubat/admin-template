import Link from 'next/link';
import { BrowserFrame, Button, GradientMesh, MagneticButton, Orbs, Reveal, RotatingWords, Sparkles } from '@nexus/ui/marketing';
import { ProductPreview } from '../../components/product-preview';
import { Band } from './band';
import { HeroCards } from './hero-cards';
import { LogoMarquee } from './logo-marquee';

export function AuroraHero({ words, logos }: { words: string[]; logos: string[] }) {
  return (
    <Band labelledBy="hero-title" tone="canvas" next="surface" wave="smooth">
      <GradientMesh tones={['primary', 'accent', 'info']} intensity="medium" />
      <Orbs tones={['primary', 'accent']} intensity="subtle" />
      <div className="relative mx-auto max-w-6xl px-4 pt-14 text-center md:px-6 md:pt-24">
        <Reveal direction="down" distance={12}>
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-1.5 text-sm font-medium backdrop-blur">
            <span aria-hidden="true" className="size-2 rounded-full bg-success" />
            Admin dashboard and landing pages, one design system
          </p>
        </Reveal>
        <h1 id="hero-title" className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-7xl">
          <span className="block">Ship a product that feels</span>
          <Sparkles count={5} tone="accent" size={[10, 18]} className="px-4">
            <RotatingWords words={words} wordClassName="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" className="pb-2" />
          </Sparkles>
        </h1>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-muted md:text-xl">
            A themeable, accessible and mobile-first admin framework with matching landing pages. Configure it, connect your API and launch.
          </p>
        </Reveal>
        <Reveal delay={0.3} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MagneticButton>
            <Button size="lg" asChild className="rounded-full px-8">
              <Link href="#pricing">Start free</Link>
            </Button>
          </MagneticButton>
          <Button size="lg" variant="secondary" asChild className="rounded-full px-8">
            <Link href="#features">See what is inside</Link>
          </Button>
        </Reveal>

        <Reveal delay={0.4} distance={48} className="relative mx-auto mt-14 max-w-4xl md:mt-20">
          <BrowserFrame url="app.nexus.dev/dashboard" className="rounded-2xl">
            <div className="[&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none">
              <ProductPreview />
            </div>
          </BrowserFrame>
          <HeroCards />
        </Reveal>
      </div>
      <LogoMarquee logos={logos} />
    </Band>
  );
}
