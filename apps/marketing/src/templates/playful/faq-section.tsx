import { IconRenderer } from '@nexus/ui/marketing';
import { BouncyReveal } from './bouncy';

/** Rounded accordion on native details/summary: keyboard and screen-reader support without script. */
export function FaqSection({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-canvas pb-12 pt-2 md:pb-20">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <h2 id="faq-title" className="mb-10 text-center text-4xl font-extrabold tracking-tight text-balance md:text-5xl">Questions, answered</h2>
        <div className="space-y-4">
          {items.map((item, i) => (
            <BouncyReveal key={item.q} delay={i * 0.06} tilt={i % 2 ? 1.5 : -1.5}>
              <details className="group rounded-3xl border-2 border-border bg-surface px-6 open:border-primary">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg font-bold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none">
                    <IconRenderer name="ChevronDown" className="size-5" />
                  </span>
                </summary>
                <p className="pb-5 text-text-muted">{item.a}</p>
              </details>
            </BouncyReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
