import { IconRenderer, Reveal } from '@nexus/ui/marketing';
import { SectionHeading } from './section-heading';

export interface Comparison {
  columns: string[];
  rows: string[][];
}

const positive = new Set(['Yes', 'Automatic']);

/** Comparison table inside a focusable, labelled scroll region so narrow screens can pan it by keyboard. */
export function ComparisonTable({ comparison }: { comparison: Comparison }) {
  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6" role="group" aria-labelledby="compare-title">
      <SectionHeading id="compare-title" eyebrow="Comparison" title="Why teams move off spreadsheets and scripts" />
      <Reveal>
        <div role="region" aria-label="Comparison table (scrollable)" tabIndex={0} className="overflow-x-auto rounded-3xl border border-border bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <table className="w-full min-w-[34rem] text-left">
            <caption className="sr-only">Comparison of spreadsheets and scripts with Nexus Research</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="p-5 text-sm font-semibold uppercase tracking-wider text-text-muted">Capability</th>
                {comparison.columns.map((c, i) => (
                  <th key={c} scope="col" className={i === 1 ? 'bg-primary/10 p-5 font-semibold text-primary' : 'p-5 font-semibold'}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map(([label, a, b]) => (
                <tr key={label} className="border-b border-border last:border-0">
                  <th scope="row" className="p-5 font-medium">{label}</th>
                  <td className="p-5 text-text-muted">{a}</td>
                  <td className="bg-primary/5 p-5 font-medium">
                    <span className="inline-flex items-center gap-2">
                      <IconRenderer name={b && positive.has(b) ? 'Check' : 'Minus'} aria-hidden="true" className="size-4 text-success" />
                      {b}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}
