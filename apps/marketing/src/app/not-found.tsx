import Link from 'next/link';
import { Button, FloatingShapes, GradientMesh, Orbs, Reveal, WaveDivider } from '@nexus/ui/marketing';
import { SiteChrome } from '../components/site-chrome';

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="relative isolate grid min-h-[70dvh] place-items-center overflow-hidden px-4 py-16 text-center">
        <GradientMesh intensity="subtle" className="-z-10" />
        <Orbs tones={['primary', 'accent']} intensity="subtle" className="-z-10" />
        <FloatingShapes count={9} seed={404} className="-z-10" />
        <div className="max-w-xl">
          <Reveal variant="blur">
            <p aria-hidden="true" className="bg-gradient-to-r from-primary to-accent bg-clip-text text-8xl font-semibold tracking-tight text-transparent md:text-9xl">
              404
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Page not found</h1>
            <p className="mt-3 text-lg text-text-muted">That page does not exist or has moved. Try one of these instead.</p>
          </Reveal>
          <Reveal delay={0.2} className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/">Back home</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/docs">Documentation</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/contact">Contact us</Link>
            </Button>
          </Reveal>
        </div>
        <WaveDivider variant="layered" fill="canvas" className="absolute inset-x-0 bottom-0 -z-10" heightClass="h-8 md:h-14" />
      </section>
    </SiteChrome>
  );
}
