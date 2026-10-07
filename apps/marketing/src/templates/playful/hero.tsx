'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AvatarStack, Badge, Blob, Button, FloatingShapes, MagneticButton, Sparkles, Squiggle, StarRating } from '@nexus/ui/marketing';
import { PhoneMock, type PhoneHabit } from './phone-mock';
import { Sticker, type StickerProps } from './sticker';

export interface PlayfulHeroProps {
  badge: string;
  lead: string;
  word: string;
  description: string;
  rating: number;
  ratingCount: number;
  people: { name: string }[];
  stickers: StickerProps[];
  phone: { title: string; habits: PhoneHabit[] };
}

/** Bold opening: morphing blobs, a squiggled headline, magnetic CTAs and a looping phone mock with stickers. */
export function PlayfulHero({ badge, lead, word, description, rating, ratingCount, people, stickers, phone }: PlayfulHeroProps) {
  const [paused, setPaused] = useState(false);
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-canvas">
      <Blob tone="warning" seed={4} opacity={0.28} animated={!paused} className="pointer-events-none absolute -left-24 -top-24 -z-10 size-[26rem] md:size-[34rem]" />
      <Blob tone="accent" seed={12} opacity={0.22} animated={!paused} className="pointer-events-none absolute -right-28 top-32 -z-10 size-[24rem] md:size-[36rem]" />
      <Blob tone="danger" seed={21} opacity={0.16} animated={!paused} className="pointer-events-none absolute bottom-0 left-1/3 -z-10 size-72" />
      <FloatingShapes paused={paused} count={9} tones={['warning', 'danger', 'accent', 'success', 'primary']} seed={5} className="-z-10" />
      <div className="mx-auto grid grid-cols-1 max-w-6xl items-center gap-14 px-4 pb-16 pt-12 md:px-6 md:pt-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Badge variant="warning" className="-rotate-2 border-2 px-3 py-1 text-sm font-bold">{badge}</Badge>
          <h1 id="hero-title" className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {lead}{' '}
            <Sparkles count={5} tone="warning" size={[12, 26]} animated={!paused}>
              <Squiggle tone="danger" className="text-primary">{word}</Squiggle>
            </Sparkles>
            .
          </h1>
          <p className="mt-8 max-w-xl text-lg text-text-muted md:text-xl">{description}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <MagneticButton>
              <Button size="lg" className="min-h-12 w-full rounded-full px-8 text-base font-bold sm:w-auto" asChild><Link href="#join">Start your circle</Link></Button>
            </MagneticButton>
            <MagneticButton>
              <Button size="lg" variant="secondary" className="min-h-12 w-full rounded-full px-8 text-base font-bold sm:w-auto" asChild><Link href="#how">See how it works</Link></Button>
            </MagneticButton>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
            <AvatarStack people={people} max={4} />
            <div>
              <StarRating value={rating} reviewCount={ratingCount} />
              <p className="mt-1 text-sm text-text-muted">Loved by 200,000 people in small groups</p>
            </div>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm px-6 sm:px-0">
          <Blob tone="primary" seed={9} opacity={0.22} animated={!paused} className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[130%] -translate-x-1/2 -translate-y-1/2" />
          <PhoneMock title={phone.title} habits={phone.habits} paused={paused} />
          {stickers.map((s, i) => (
            <Sticker key={s.label} {...s} paused={paused} delay={i * 0.8} />
          ))}
          <div className="mt-8 flex justify-center">
            <Button variant="secondary" size="sm" className="min-h-11 rounded-full px-5" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
              {paused ? 'Play animations' : 'Pause animations'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
