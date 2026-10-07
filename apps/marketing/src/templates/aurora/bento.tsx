import { IconRenderer, Reveal, SpotlightCard, TiltCard, cn } from '@nexus/ui/marketing';
import { Band } from './band';
import { BentoVisual, type BentoVisualKind } from './bento-visuals';
import { AuroraHeading } from './heading';
import { FeatureList, type FeatureItem } from './feature-list';

export interface AuroraBentoItem {
  icon: string;
  title: string;
  description: string;
  visual: BentoVisualKind;
}

const spans = ['md:col-span-4', 'md:col-span-2', 'md:col-span-2', 'md:col-span-4'];

export function AuroraBento({ items, features }: { items: readonly AuroraBentoItem[]; features: FeatureItem[] }) {
  return (
    <Band id="features" labelledBy="features-title" tone="surface" next="canvas" wave="layered">
      <div className="mx-auto max-w-6xl px-4 pt-16 md:px-6 md:pt-24">
        <AuroraHeading id="features-title" eyebrow="Features" description="Every module shares the same tokens, components and states, so nothing feels bolted on.">
          Everything an admin needs, nothing you rebuild
        </AuroraHeading>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-6">
          {items.map((item, i) => (
            <Reveal key={item.title} as="li" delay={i * 0.1} className={cn(spans[i % spans.length])}>
              <TiltCard maxTilt={4} scale={1.01} className="h-full">
              <SpotlightCard className="h-full rounded-3xl bg-canvas p-6 shadow-card">
                <span className="mb-4 grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <IconRenderer name={item.icon} className="size-5" />
                </span>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mb-6 mt-2 text-sm text-text-muted">{item.description}</p>
                <BentoVisual kind={item.visual} />
              </SpotlightCard>
              </TiltCard>
            </Reveal>
          ))}
        </ul>
        <FeatureList features={features} />
      </div>
    </Band>
  );
}
