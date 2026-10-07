import Link from 'next/link';
import { Button, Reveal, SectionShell, Timeline } from '@nexus/ui/marketing';
import { whatsNew } from '../../content/product';

/** "What's new" timeline with a link to the full changelog. */
export function WhatsNew() {
  return (
    <SectionShell id="new" eyebrow="What's new" title="Always moving forward" description="A steady cadence of small, finished releases." align="left" className="max-w-3xl">
      <Timeline label="Recent product updates" items={whatsNew} />
      <Reveal className="mt-10">
        <Button variant="secondary" asChild>
          <Link href="/changelog">Read the full changelog</Link>
        </Button>
      </Reveal>
    </SectionShell>
  );
}
