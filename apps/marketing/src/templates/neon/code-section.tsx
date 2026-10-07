import Link from 'next/link';
import { Button, CodeViewer, GlowBorder, IconRenderer, Reveal, cn } from '@nexus/ui/marketing';
import { NeonHeading } from './heading';
import { neon } from './neon';

const points = ['Typed SDK with streaming and retries', 'Every answer returns its sources', 'Prompt versions pinned per call'];

export function NeonCode({ code }: { code: string }) {
  return (
    <section id="developers" aria-labelledby="developers-title" className="relative mx-auto grid grid-cols-1 max-w-6xl items-center gap-10 px-4 pb-20 md:px-6 md:pb-28 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="min-w-0">
        <NeonHeading id="developers-title" eyebrow="For developers" align="left" description="Ask a question, get a cited answer. Retrieval, prompts and evaluation stay behind one call.">
          From question to cited answer in one call
        </NeonHeading>
        <ul className="space-y-3">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-3">
              <span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-success text-success-foreground">
                <IconRenderer name="Check" className="size-3.5" />
              </span>
              <span className={cn(neon.muted)}>{p}</span>
            </li>
          ))}
        </ul>
        <Button variant="secondary" size="lg" asChild className="mt-8">
          <Link href="/docs">Read the docs</Link>
        </Button>
      </div>
      <Reveal direction="left" distance={32} className="min-w-0">
        <GlowBorder className="rounded-3xl shadow-popover" innerClassName="rounded-[calc(1.5rem-2px)] p-2">
          <CodeViewer code={code} language="typescript" lineNumbers label="Example: ask a question with the Nexus AI SDK" className="border-0" />
        </GlowBorder>
      </Reveal>
    </section>
  );
}
