import { Reveal } from '@nexus/ui/marketing';

/** Left-aligned editorial heading used by every Editorial section. */
export function SectionHeading({ id, eyebrow, title, description }: { id: string; eyebrow: string; title: string; description?: string }) {
  return (
    <Reveal className="mb-12 max-w-3xl md:mb-16">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">{title}</h2>
      {description && <p className="mt-5 text-lg text-text-muted md:text-xl">{description}</p>}
    </Reveal>
  );
}
