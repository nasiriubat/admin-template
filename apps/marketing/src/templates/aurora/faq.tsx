import { IconRenderer, RevealGroup } from '@nexus/ui/marketing';
import { Band } from './band';
import { AuroraHeading } from './heading';

export function AuroraFaq({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <Band id="faq" tone="surface" next="primary" wave="curve" labelledBy="faq-title">
      <div className="mx-auto max-w-3xl px-4 pt-16 md:px-6 md:pt-24">
        <AuroraHeading id="faq-title" eyebrow="FAQ">
          Questions, answered
        </AuroraHeading>
        <RevealGroup stagger={0.08} className="space-y-3 pb-6">
          {items.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-border bg-canvas px-5 py-1 open:shadow-card">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                {item.q}
                <IconRenderer name="ChevronDown" className="size-4 shrink-0 text-text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none" />
              </summary>
              <p className="pb-4 text-text-muted">{item.a}</p>
            </details>
          ))}
        </RevealGroup>
      </div>
    </Band>
  );
}
