import { IconRenderer, Reveal, SpotlightCard, cn } from '@nexus/ui/marketing';
import { NeonHeading } from './heading';
import { neon } from './neon';

export interface NeonFeature {
  icon: string;
  title: string;
  description: string;
}

export function NeonFeatures({ features }: { features: NeonFeature[] }) {
  return (
    <section id="features" aria-labelledby="features-title" className="relative mx-auto max-w-6xl px-4 pb-20 md:px-6 md:pb-28">
      <NeonHeading id="features-title" eyebrow="Production ready" description="The boring parts of running an assistant in production, handled.">
        Designed for production
      </NeonHeading>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} as="li" delay={(i % 3) * 0.1} className="h-full">
            <SpotlightCard tone="primary" radius={380} className={cn('h-full rounded-3xl p-6', neon.panel)}>
              <span className="mb-4 grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_20px_-4px_rgb(var(--primary-rgb)/0.9)]">
                <IconRenderer name={f.icon} className="size-5" />
              </span>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className={cn('mt-2 text-sm', neon.muted)}>{f.description}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
