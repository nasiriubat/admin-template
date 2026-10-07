import { Badge, IconRenderer, RevealGroup } from '@nexus/ui/marketing';
import { SectionHeading } from './section-heading';

export interface SecurityItem {
  icon: string;
  title: string;
  description: string;
  tag: string;
}

/** Security and compliance controls, revealed in a stagger. */
export function SecurityGrid({ items }: { items: SecurityItem[] }) {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6" role="group" aria-labelledby="security-title">
      <SectionHeading id="security-title" eyebrow="Security and compliance" title="Controls your reviewers will recognise" description="Built to pass procurement review, with evidence your auditors can export." />
      <RevealGroup as="ul" itemAs="li" stagger={0.07} variant="slide" distance={20} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" itemClassName="h-full">
        {items.map((s) => (
          <div key={s.title} className="flex h-full gap-4 rounded-2xl bg-canvas p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-success/15 text-success">
              <IconRenderer name={s.icon} className="size-5" />
            </span>
            <div>
              <Badge variant="neutral">{s.tag}</Badge>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-text-muted">{s.description}</p>
            </div>
          </div>
        ))}
      </RevealGroup>
    </div>
  );
}
