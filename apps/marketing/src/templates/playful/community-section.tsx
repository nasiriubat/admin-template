import { Avatar, AvatarStack, Carousel, Marquee, StarRating } from '@nexus/ui/marketing';
import { BouncyReveal } from './bouncy';
import { solid, type PlayTone } from './tones';

export interface Chip {
  name: string;
  text: string;
}
export interface PlayTestimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
}

const chipTones: PlayTone[] = ['warning', 'danger', 'accent', 'success', 'info', 'primary'];

/** Community wins scrolling past, then a testimonial carousel with ratings. */
export function CommunitySection({ chips, testimonials, people }: { chips: Chip[]; testimonials: PlayTestimonial[]; people: { name: string }[] }) {
  return (
    <section id="community" aria-labelledby="community-title" className="bg-canvas pb-12 pt-2 md:pb-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 id="community-title" className="text-4xl font-extrabold tracking-tight text-balance md:text-5xl">Tiny wins, shared out loud</h2>
          <p className="mt-4 text-lg text-text-muted">A peek at what circles are celebrating right now.</p>
        </div>
      </div>
      <Marquee label="Recent wins from the community" speed={42} gap={16}>
        {chips.map((c, i) => (
          <span key={c.name} className="flex items-center gap-3 rounded-full border-2 border-border bg-surface py-2 pl-2 pr-5 shadow-card">
            <span className={`grid size-9 place-items-center rounded-full text-sm font-bold ${solid[chipTones[i % chipTones.length]!]}`}>{c.name.slice(0, 1)}</span>
            <span className="whitespace-nowrap text-sm font-semibold">{c.text}</span>
          </span>
        ))}
      </Marquee>
      <div className="mx-auto mt-16 max-w-6xl px-4 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-2xl font-bold">What circles say</h3>
          <AvatarStack people={people} max={5} />
        </div>
        <BouncyReveal>
          <Carousel label="Member testimonials" autoplay interval={8000} slideClassName="basis-full md:basis-[calc(50%-0.5rem)]">
            {testimonials.map((t, i) => (
              <figure key={t.name} className={`flex h-full flex-col rounded-[2rem] border-2 border-border bg-surface p-7 shadow-card ${i % 2 ? 'md:rotate-1' : 'md:-rotate-1'}`}>
                <StarRating value={t.rating} sizeClass="size-5" />
                <blockquote className="mt-4 flex-1 text-lg font-medium">{t.quote}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <Avatar name={t.name} size="md" />
                  <span>
                    <span className="block font-bold">{t.name}</span>
                    <span className="block text-sm text-text-muted">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </Carousel>
        </BouncyReveal>
      </div>
    </section>
  );
}
