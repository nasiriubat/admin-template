'use client';

import { useEffect, useState } from 'react';
import { IconRenderer, PhoneFrame, usePrefersReducedMotion } from '@nexus/ui/marketing';
import { solid, toneOf } from './tones';

export interface PhoneHabit {
  label: string;
  who: string;
  tone: string;
}

const STEPS = 5;

/** Number of habits to show as done for a given tick (0..3, then a beat on 3 and a reset). */
export function doneCount(step: number, total: number): number {
  return Math.min(step, total);
}

/**
 * Looping mock of the app: habits tick off one after another, the progress ring fills and a cheer
 * pops in. The whole mock is decorative (aria-hidden); the loop stops when paused or under reduced motion.
 */
export function PhoneMock({ title, habits, paused }: { title: string; habits: PhoneHabit[]; paused?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const still = reduced || paused;
  useEffect(() => {
    if (still) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % STEPS), 1500);
    return () => window.clearInterval(id);
  }, [still]);

  const shown = reduced ? habits.length - 1 : step;
  const done = doneCount(shown, habits.length);
  const pct = Math.round((done / habits.length) * 100);
  const cheer = (reduced ? true : step >= habits.length);
  return (
    <div aria-hidden="true">
      <PhoneFrame screenClassName="relative">
        <div className="absolute inset-0 flex flex-col gap-3 bg-canvas px-4 pb-4 pt-10 text-text">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">{title}</p>
            <span className="rounded-full bg-warning px-2 py-0.5 text-[11px] font-bold text-warning-foreground">12 day streak</span>
          </div>
          <div>
            <div className="h-3 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out motion-reduce:transition-none" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-text-muted">{done} of {habits.length} done today</p>
          </div>
          <ul className="space-y-2">
            {habits.map((h, i) => {
              const isDone = i < done;
              return (
                <li key={h.label} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2.5">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${solid[toneOf(h.tone)]}`}>{h.who.slice(0, 1)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold">{h.label}</span>
                    <span className="block text-[11px] text-text-muted">with {h.who}</span>
                  </span>
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full border-2 transition-all duration-300 motion-reduce:transition-none ${isDone ? 'scale-110 border-success bg-success text-success-foreground' : 'border-border-strong'}`}>
                    {isDone && <IconRenderer name="Check" className="size-4" />}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className={`mt-auto flex items-center gap-2 rounded-2xl bg-danger p-3 text-danger-foreground transition-all duration-500 motion-reduce:transition-none ${cheer ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
            <IconRenderer name="Heart" className="size-4" />
            <span className="text-xs font-semibold">Leo sent you a cheer</span>
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
}
