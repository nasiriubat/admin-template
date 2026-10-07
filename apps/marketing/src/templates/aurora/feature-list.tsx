import { IconRenderer, RevealGroup } from '@nexus/ui/marketing';

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

/** Open (card-less) feature list under the bento so the section does not become a wall of boxes. */
export function FeatureList({ features }: { features: FeatureItem[] }) {
  return (
    <RevealGroup as="ul" itemAs="li" stagger={0.07} className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 pb-6 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <div key={f.title} className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
            <IconRenderer name={f.icon} className="size-5" />
          </span>
          <div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-text-muted">{f.description}</p>
          </div>
        </div>
      ))}
    </RevealGroup>
  );
}
