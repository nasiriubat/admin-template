'use client';

import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Children, useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { usePrefersReducedMotion } from './shared';

export interface CarouselProps {
  children: ReactNode;
  /** Accessible name of the carousel (required). */
  label: string;
  /** Start rotating automatically. Never starts under reduced motion; a pause/play button is always shown when set. */
  autoplay?: boolean;
  /** Autoplay delay in ms. */
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
  /** Sizing of each slide, e.g. `basis-full md:basis-1/2 lg:basis-1/3`. */
  slideClassName?: string;
}

const btn =
  'inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface text-text transition-colors hover:bg-surface-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/**
 * Accessible carousel (WAI-ARIA APG): region + roledescription, slide groups, native scroll-snap
 * (touch swipe), prev/next, dot buttons, arrow/Home/End keys, polite announcements. Autoplay pauses
 * on hover/focus and always has a visible pause/play control.
 */
export function Carousel({ children, label, autoplay = false, interval = 6000, showArrows = true, showDots = true, className, slideClassName = 'basis-full' }: CarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [interacting, setInteracting] = useState(false);

  // Autoplay is opt-in and never begins under reduced motion.
  useEffect(() => {
    setPlaying(autoplay && !reduced);
  }, [autoplay, reduced]);

  const goTo = useCallback(
    (i: number) => {
      if (count === 0) return;
      const next = ((i % count) + count) % count;
      setIndex(next);
      const track = trackRef.current;
      const el = track?.children[next] as HTMLElement | undefined;
      if (track && el && track.scrollTo) track.scrollTo({ left: el.offsetLeft - track.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
    },
    [count, reduced],
  );

  useEffect(() => {
    if (!playing || interacting || count < 2) return;
    const id = window.setTimeout(() => goTo(index + 1), interval);
    return () => window.clearTimeout(id);
  }, [playing, interacting, index, interval, count, goTo]);

  // Keep the index in sync when the user swipes / scrolls natively.
  const raf = useRef(0);
  const onScroll = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;
      let best = 0;
      let dist = Infinity;
      Array.from(track.children).forEach((c, i) => {
        const d = Math.abs((c as HTMLElement).offsetLeft - track.offsetLeft - track.scrollLeft);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      setIndex(best);
    });
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const t = e.target as HTMLElement;
    if (t.matches('input, textarea, select, [contenteditable="true"]')) return;
    if (e.key === 'ArrowRight') goTo(index + 1);
    else if (e.key === 'ArrowLeft') goTo(index - 1);
    else if (e.key === 'Home') goTo(0);
    else if (e.key === 'End') goTo(count - 1);
    else return;
    e.preventDefault();
  };

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn('relative', className)}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={() => setInteracting(false)}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        // Focusable so keyboard users can scroll the region with the arrow keys (axe: scrollable-region-focusable).
        tabIndex={0}
        role="group"
        aria-label={`${label} slides`}
        aria-live={playing ? 'off' : 'polite'}
        className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className={cn('min-w-0 shrink-0 snap-start', slideClassName)}
          >
            {slide}
          </div>
        ))}
      </div>

      <p role="status" aria-live={playing ? 'off' : 'polite'} className="sr-only">
        {`Slide ${index + 1} of ${count}`}
      </p>

      {(showArrows || showDots || autoplay) && count > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {autoplay && (
            <button type="button" className={btn} onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause automatic slide rotation' : 'Start automatic slide rotation'}>
              {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
            </button>
          )}
          {showArrows && (
            <button type="button" className={btn} onClick={() => goTo(index - 1)} aria-label="Previous slide">
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
          )}
          {showDots && (
            <div role="group" aria-label="Choose slide" className="flex items-center">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index ? 'true' : undefined}
                  className="group flex size-7 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span className={cn('block rounded-full transition-all', i === index ? 'h-2.5 w-6 bg-primary' : 'size-2.5 bg-border-strong group-hover:bg-text-muted')} />
                </button>
              ))}
            </div>
          )}
          {showArrows && (
            <button type="button" className={btn} onClick={() => goTo(index + 1)} aria-label="Next slide">
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
