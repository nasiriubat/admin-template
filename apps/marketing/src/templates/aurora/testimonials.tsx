import { AvatarStack, Carousel, Reveal, StarRating } from '@nexus/ui/marketing';
import { Band } from './band';
import { AuroraHeading } from './heading';

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('');

export function AuroraTestimonials({ items, people }: { items: Testimonial[]; people: string[] }) {
  return (
    <Band id="stories" tone="surface" next="canvas" wave="layered" flip labelledBy="stories-title">
      <div className="mx-auto max-w-6xl px-4 pt-16 md:px-6 md:pt-24">
        <AuroraHeading id="stories-title" eyebrow="Customer stories" description="Teams replace three dashboards with one codebase and stop fixing spacing.">
          Teams ship faster with Nexus
        </AuroraHeading>
        <Reveal className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
          <AvatarStack people={people.map((name) => ({ name }))} max={5} />
          <StarRating value={5} sizeClass="size-5" />
          <span className="text-sm text-text-muted">Loved by product teams</span>
        </Reveal>
        <Carousel label="Customer stories" autoplay interval={7000} slideClassName="basis-full md:basis-1/2 lg:basis-1/3" className="pb-8">
          {items.map((t) => (
            <figure key={t.name} className="flex h-full flex-col justify-between rounded-3xl border border-border bg-canvas p-6 shadow-card">
              <div>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="mb-3 size-8 fill-primary/30">
                  <path d="M4 18v-6c0-4 2.5-6.5 6-7v3C8.3 8.4 7.5 9.5 7.5 11H10v7H4Zm10 0v-6c0-4 2.5-6.5 6-7v3c-1.7.4-2.5 1.5-2.5 3H20v7h-6Z" />
                </svg>
                <StarRating value={5} className="mb-3" />
                <blockquote className="text-text">{t.quote}</blockquote>
              </div>
              <figcaption className="mt-6 flex items-center gap-3 text-sm">
                <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {initials(t.name)}
                </span>
                <span>
                  <span className="block font-semibold">{t.name}</span>
                  <span className="block text-text-muted">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </Carousel>
      </div>
    </Band>
  );
}
