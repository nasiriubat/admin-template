import { IconRenderer, Marquee, Reveal, SectionShell } from '@nexus/ui/marketing';
import { integrationNames } from '../../content/product';

/** Integrations ticker. Marquee supplies pause/hover/focus pause and a static wrapped list under reduced motion. */
export function IntegrationsStrip() {
  return (
    <SectionShell id="integrations" eyebrow="Integrations" title="Plays well with your stack" description="Typed contracts and documented hooks for the systems you already run." className="pb-10 md:pb-14">
      <Reveal>
        <Marquee label="Supported integrations" speed={45} gap={16} itemClassName="">
          {integrationNames.map((i) => (
            <span key={i.name} className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium shadow-card">
              <IconRenderer name={i.icon} className="size-4 text-primary" />
              {i.name}
            </span>
          ))}
        </Marquee>
      </Reveal>
    </SectionShell>
  );
}
