'use client';

import { useEffect, useState } from 'react';
import { GlowBorder, IconRenderer, Typewriter, cn, usePrefersReducedMotion } from '@nexus/ui/marketing';
import { FINAL_STAGE, demoScript, nextStage, stageDuration } from './demo-script';
import { neon } from './neon';

const chip = cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs', neon.panel);

/**
 * Live-looking agent demo. It steps through a scripted question, retrieval, cited answer and
 * evaluation score. Under reduced motion it shows the finished conversation and never moves; with
 * motion it loops and always offers a pause button (WCAG 2.2.2).
 */
export function ChatDemo() {
  const reduced = usePrefersReducedMotion();
  const [stage, setStage] = useState(FINAL_STAGE);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const animating = started && !reduced;

  // Server and first paint show the finished state; motion starts after mount.
  useEffect(() => {
    if (reduced) {
      setStage(FINAL_STAGE);
      setStarted(false);
      return;
    }
    setStarted(true);
    setStage(0);
  }, [reduced]);

  useEffect(() => {
    if (!animating || paused) return;
    const id = window.setTimeout(() => setStage((s) => nextStage(s)), stageDuration(stage));
    return () => window.clearTimeout(id);
  }, [animating, paused, stage]);

  return (
    <GlowBorder className="w-full rounded-3xl shadow-popover" innerClassName="rounded-[calc(1.5rem-2px)] bg-secondary" thickness={2}>
      <div role="group" aria-label="Demo of an assistant answering a question with cited sources" className="text-secondary-foreground">
        <div className={cn('flex items-center justify-between gap-3 border-b px-4 py-2', neon.border)}>
          <div className="flex min-w-0 items-center gap-2">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-success" />
            <span className={cn('truncate font-mono text-xs', neon.muted)}>
              {demoScript.workspace} · {demoScript.prompt}
            </span>
          </div>
          {animating && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? 'Play the demo' : 'Pause the demo'}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-[color:color-mix(in_srgb,var(--secondary-foreground)_12%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <IconRenderer name={paused ? 'Play' : 'Pause'} className="size-4" />
            </button>
          )}
        </div>

        <div className="min-h-[21rem] space-y-4 p-4 sm:p-5">
          <div className="flex justify-end">
            <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">{demoScript.question}</p>
          </div>

          {stage >= 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className={chip}>
                <IconRenderer name={stage === 1 ? 'RefreshCw' : 'Check'} className={cn('size-3.5', stage === 1 && animating && 'animate-spin motion-reduce:animate-none')} />
                {demoScript.tool}
              </span>
              {stage >= 2 &&
                demoScript.sources.map((s, i) => (
                  <span key={s} className={chip}>
                    <span className="font-semibold">[{i + 1}]</span> {s}
                  </span>
                ))}
            </div>
          )}

          {stage >= 3 && (
            <div className="flex gap-3">
              <span aria-hidden="true" className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <IconRenderer name="Sparkles" className="size-4" />
              </span>
              <p className={cn('rounded-2xl rounded-tl-md px-4 py-2.5 text-sm leading-relaxed', neon.panel)}>
                <Typewriter text={demoScript.answer} speed={24} cursor={stage === 3} />
              </p>
            </div>
          )}

          {stage >= FINAL_STAGE && (
            <p className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 pl-11 text-xs', neon.muted)}>
              <span className="inline-flex items-center gap-1.5">
                <IconRenderer name="ShieldCheck" className="size-3.5" /> Groundedness {demoScript.grounded}
              </span>
              <span>3 sources cited</span>
              <span>412 ms</span>
            </p>
          )}
        </div>
      </div>
    </GlowBorder>
  );
}
