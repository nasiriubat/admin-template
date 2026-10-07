import { IconRenderer } from '../icons/icon-renderer';
import { SectionShell } from './marketing-nav';
import { Reveal } from './motion/reveal';

export interface Integration {
  name: string;
  category: string;
  icon: string;
}

/** Text + icon tiles (no third-party logos, so there is nothing to license). */
export function IntegrationsGrid({ id, eyebrow, title, description, items }: { id?: string; eyebrow?: string; title: string; description?: string; items: Integration[] }) {
  return (
    <SectionShell id={id} eyebrow={eyebrow} title={title} description={description}>
      <ul className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {items.map((i, n) => (
          <Reveal as="li" key={i.name} variant="scale" delay={(n % 4) * 0.06} className="flex items-center gap-3 rounded-card border border-border bg-surface p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-canvas text-text">
              <IconRenderer name={i.icon} className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium">{i.name}</span>
              <span className="block truncate text-xs text-text-muted">{i.category}</span>
            </span>
          </Reveal>
        ))}
      </ul>
    </SectionShell>
  );
}

export interface BandItem {
  icon: string;
  title: string;
  description: string;
}

/** Full-width surface band for security / compliance claims. */
export function TrustBand({ id, title, description, items }: { id?: string; title: string; description: string; items: BandItem[] }) {
  return (
    <section id={id} aria-labelledby={`${id ?? 'trust'}-title`} className="border-y border-border bg-surface">
      <div className="mx-auto grid grid-cols-1 max-w-6xl gap-10 px-4 py-16 md:px-6 lg:grid-cols-[1fr_2fr] lg:py-20">
        <div>
          <h2 id={`${id ?? 'trust'}-title`} className="text-3xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="mt-4 text-text-muted">{description}</p>
        </div>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {items.map((i, n) => (
            <Reveal as="li" key={i.title} delay={n * 0.08} className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-success/10 text-success">
                <IconRenderer name={i.icon} className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{i.title}</h3>
                <p className="mt-1 text-sm text-text-muted">{i.description}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
