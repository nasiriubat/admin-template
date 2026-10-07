import { IconRenderer, TiltCard } from '@nexus/ui/marketing';
import { BouncyReveal } from './bouncy';
import { solid, ring, toneOf } from './tones';

export interface PlayFeature {
  icon: string;
  title: string;
  description: string;
  tone: string;
}

/** Feature cards that tilt toward the pointer and pop in with a spring. */
export function FeaturesSection({ features }: { features: PlayFeature[] }) {
  return (
    <section id="features" aria-labelledby="features-title" className="bg-surface pb-12 pt-4 md:pb-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="inline-block -rotate-2 rounded-full bg-accent px-4 py-1 text-sm font-bold text-accent-foreground">Made for real life</p>
          <h2 id="features-title" className="mt-4 text-4xl font-extrabold tracking-tight text-balance md:text-5xl">Everything a friendly habit needs</h2>
        </div>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const tone = toneOf(f.tone);
            return (
              <BouncyReveal as="li" key={f.title} delay={(i % 3) * 0.08} tilt={i % 2 ? 3 : -3}>
                <TiltCard maxTilt={7} className={`h-full rounded-[2rem] border-2 bg-canvas p-7 shadow-card ${ring[tone]}`}>
                  <span className={`grid size-14 place-items-center rounded-2xl ${solid[tone]}`}>
                    <IconRenderer name={f.icon} className="size-7" />
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{f.title}</h3>
                  <p className="mt-2 text-text-muted">{f.description}</p>
                </TiltCard>
              </BouncyReveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
