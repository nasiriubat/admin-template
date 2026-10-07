import { IconRenderer } from '@nexus/ui/marketing';

export interface PullQuoteProps {
  quote: string;
  name: string;
  role: string;
  org: string;
}

/** Large editorial quotation with attribution. Uses real blockquote/figcaption semantics. */
export function PullQuote({ quote, name, role, org }: PullQuoteProps) {
  return (
    <figure>
      <IconRenderer name="Quote" aria-hidden="true" className="size-10 text-primary/60" />
      <blockquote className="mt-4 text-2xl font-medium leading-snug tracking-tight text-balance md:text-3xl">{quote}</blockquote>
      <figcaption className="mt-6 text-base">
        <span className="font-semibold">{name}</span>
        <span className="text-text-muted">, {role}, {org}</span>
      </figcaption>
    </figure>
  );
}
