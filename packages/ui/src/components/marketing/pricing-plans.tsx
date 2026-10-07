'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Reveal } from './motion/reveal';
import { formatPrice, maxSavingsPercent, planPrice, yearlySavingsPercent, type BillingCycle, type MatrixGroup, type MatrixValue, type PlanDef } from './pricing-utils';

export function MatrixCell({ value }: { value: MatrixValue }) {
  if (typeof value === 'string') return <span className="text-sm">{value}</span>;
  return value ? (
    <>
      <IconRenderer name="Check" className="mx-auto size-5 text-success" />
      <span className="sr-only">Included</span>
    </>
  ) : (
    <>
      <IconRenderer name="X" className="mx-auto size-4 text-text-muted" />
      <span className="sr-only">Not included</span>
    </>
  );
}

function ComparisonTable({ plans, groups }: { plans: PlanDef[]; groups: MatrixGroup[] }) {
  return (
    <table className="hidden w-full border-separate border-spacing-0 text-left md:table">
      <caption className="sr-only">Feature comparison across plans</caption>
      <thead>
        <tr>
          <th scope="col" className="sticky top-16 z-10 border-b border-border bg-canvas p-4 text-sm font-medium text-text-muted">
            Features
          </th>
          {plans.map((p) => (
            <th key={p.id} scope="col" className={cn('sticky top-16 z-10 border-b border-border bg-canvas p-4 text-center text-sm font-semibold', p.featured && 'text-primary')}>
              {p.name}
            </th>
          ))}
        </tr>
      </thead>
      {groups.map((g) => (
        <tbody key={g.title}>
          <tr>
            <th colSpan={plans.length + 1} scope="colgroup" className="bg-surface p-3 px-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
              {g.title}
            </th>
          </tr>
          {g.rows.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="border-b border-border p-4 text-sm font-normal">
                {row.label}
              </th>
              {plans.map((p) => (
                <td key={p.id} className="border-b border-border p-4 text-center">
                  <MatrixCell value={row.values[p.id] ?? false} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  );
}

function ComparisonAccordions({ plans, groups }: { plans: PlanDef[]; groups: MatrixGroup[] }) {
  return (
    <div className="divide-y divide-border rounded-card border border-border bg-surface md:hidden">
      {plans.map((p) => (
        <details key={p.id} className="group p-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
            {p.name}
            <IconRenderer name="ChevronDown" className="size-4 text-text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none" />
          </summary>
          <div className="mt-3 space-y-5">
            {groups.map((g) => (
              <section key={g.title} aria-label={g.title}>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">{g.title}</h4>
                <dl className="divide-y divide-border text-sm">
                  {g.rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4 py-2.5">
                      <dt>{row.label}</dt>
                      <dd className="shrink-0 text-right">
                        <MatrixCell value={row.values[p.id] ?? false} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

/** Billing toggle + plan cards + full comparison matrix. Client component because of the cycle switch. */
export function PricingPlans({ plans, groups, yearlyNote = 'billed yearly' }: { plans: PlanDef[]; groups: MatrixGroup[]; yearlyNote?: string }) {
  const [cycle, setCycle] = useState<BillingCycle>('yearly');
  const labelId = useId();
  const savings = maxSavingsPercent(plans);
  const yearly = cycle === 'yearly';
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-10 flex flex-wrap items-center justify-center gap-3 text-sm font-medium">
        <span className={cn(!yearly ? 'text-text' : 'text-text-muted')} aria-hidden="true">
          Monthly
        </span>
        <Switch checked={yearly} onCheckedChange={(v) => setCycle(v ? 'yearly' : 'monthly')} aria-labelledby={labelId} />
        <span id={labelId} className={cn(yearly ? 'text-text' : 'text-text-muted')}>
          <span className="sr-only">Bill yearly: </span>Yearly
        </span>
        {savings > 0 && <Badge variant="success">Save up to {savings}%</Badge>}
      </div>

      {/* Keeps the heading outline h1 > h2 > h3 for pages where the plans follow the page hero directly. */}
      <h2 className="sr-only">Plans</h2>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan, i) => {
          const price = planPrice(plan, cycle);
          const save = yearlySavingsPercent(plan);
          return (
            <Reveal as="li" key={plan.id} delay={i * 0.08} className={cn('relative flex flex-col rounded-card border bg-surface p-6 shadow-card transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0', plan.featured ? 'border-primary ring-1 ring-primary' : 'border-border')}>
              {plan.featured && <Badge variant="primary" className="absolute -top-3 left-6 bg-surface">Most popular</Badge>}
              <h3 className="font-semibold">{plan.name}</h3>
              <p className="mt-3 flex items-baseline gap-1" aria-live="polite">
                <span className="text-4xl font-semibold tracking-tight">{formatPrice(price)}</span>
                {price !== null && price > 0 && <span className="text-sm text-text-muted">/ month</span>}
              </p>
              <p className="mt-1 min-h-5 text-xs text-text-muted">{price !== null && price > 0 ? (yearly ? `${yearlyNote}${save ? `, save ${save}%` : ''}` : 'billed monthly') : ' '}</p>
              <p className="mt-3 text-sm text-text-muted">{plan.description}</p>
              <ul className="my-6 flex-1 space-y-2.5 text-sm">
                {plan.highlights.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <IconRenderer name="Check" className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant={plan.featured ? 'primary' : 'secondary'} asChild>
                <Link href={plan.cta.href}>{plan.cta.label}</Link>
              </Button>
            </Reveal>
          );
        })}
      </ul>

      <h2 className="mb-6 mt-20 text-center text-2xl font-semibold tracking-tight md:text-3xl">Compare every feature</h2>
      <ComparisonTable plans={plans} groups={groups} />
      <ComparisonAccordions plans={plans} groups={groups} />
    </div>
  );
}
