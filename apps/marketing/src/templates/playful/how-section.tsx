import { Orbs, Squiggle } from '@nexus/ui/marketing';
import { BouncyReveal } from './bouncy';
import { solid, type PlayTone } from './tones';

const stepTones: PlayTone[] = ['warning', 'danger', 'accent'];

/** Three bold steps on a solid secondary band, each marked by a numbered sticker. */
export function HowSection({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <section id="how" aria-labelledby="how-title" className="relative isolate overflow-hidden bg-secondary pb-12 pt-2 text-secondary-foreground md:pb-20">
      <Orbs tones={['warning', 'danger', 'accent']} intensity="subtle" />
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 id="how-title" className="mx-auto max-w-2xl text-center text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
          Three taps from <Squiggle tone="warning" animated>zero</Squiggle> to streak
        </h2>
        <ol className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((s, i) => (
            <BouncyReveal as="li" key={s.title} delay={i * 0.12} tilt={i % 2 ? 4 : -4} className="relative rounded-[2rem] border-2 border-secondary-foreground/30 p-7 pt-12">
              <span className={`absolute -top-7 left-6 grid size-14 -rotate-6 place-items-center rounded-2xl text-2xl font-extrabold shadow-popover ${solid[stepTones[i % stepTones.length]!]}`}>{i + 1}</span>
              <h3 className="text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-secondary-foreground/85">{s.description}</p>
            </BouncyReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
