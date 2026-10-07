import { IconRenderer, RevealGroup, cn } from '@nexus/ui/marketing';
import { NeonHeading } from './heading';
import { neon } from './neon';

export function NeonFaq({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative mx-auto max-w-3xl px-4 pb-20 md:px-6 md:pb-28">
      <NeonHeading id="faq-title" eyebrow="FAQ">
        Frequently asked
      </NeonHeading>
      <RevealGroup stagger={0.08} className="space-y-3">
        {items.map((item) => (
          <details key={item.q} className={cn('group rounded-2xl px-5 py-1', neon.panel)}>
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
              {item.q}
              <IconRenderer name="ChevronDown" className="size-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <p className={cn('pb-4', neon.muted)}>{item.a}</p>
          </details>
        ))}
      </RevealGroup>
    </section>
  );
}
