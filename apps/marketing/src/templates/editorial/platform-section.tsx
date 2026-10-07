import { IconRenderer, RevealGroup, SpotlightCard } from '@nexus/ui/marketing';
import { SectionHeading } from './section-heading';

export interface PlatformFeature {
  icon: string;
  title: string;
  description: string;
}

/** Feature list laid out as open columns with a soft spotlight, avoiding boxed card walls. */
export function PlatformSection({ features }: { features: PlatformFeature[] }) {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6" aria-labelledby="platform-title" role="group">
      <SectionHeading id="platform-title" eyebrow="Platform" title="Built for rigour and review" description="Every capability exists to make a result easier to trust, check and repeat." />
      <RevealGroup as="ul" itemAs="li" stagger={0.09} className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <SpotlightCard key={f.title} tone="info" className="h-full rounded-3xl p-6">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <IconRenderer name={f.icon} className="size-6" />
            </span>
            <h3 className="mt-5 text-xl font-semibold tracking-tight">{f.title}</h3>
            <p className="mt-2 text-text-muted">{f.description}</p>
          </SpotlightCard>
        ))}
      </RevealGroup>
    </div>
  );
}
