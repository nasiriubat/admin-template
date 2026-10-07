import Link from 'next/link';
import type { ReactNode } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { MarketingLink } from './marketing-nav';

export function Hero({ badge, title, highlight, description, primary, secondary, visual }: { badge?: string; title: string; highlight?: string; description: string; primary: MarketingLink; secondary?: MarketingLink; visual?: ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(60%_60%_at_50%_0%,rgb(var(--primary-rgb)/0.18),transparent)]" />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center md:px-6 md:pb-24 md:pt-24">
        {badge && (
          <Badge variant="primary" className="mb-6">
            {badge}
          </Badge>
        )}
        <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          {title} {highlight && <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{highlight}</span>}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-muted md:text-xl">{description}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href={primary.href}>{primary.label}</Link>
          </Button>
          {secondary && (
            <Button size="lg" variant="secondary" asChild>
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          )}
        </div>
        {visual && <div className="mx-auto mt-14 max-w-5xl">{visual}</div>}
      </div>
    </section>
  );
}
