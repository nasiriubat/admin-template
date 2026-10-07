'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';
import { Button } from '../ui/button';
import { BrandMark } from '../shell/brand-mark';
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/dialog';

export interface MarketingLink {
  label: string;
  href: string;
}

export function MarketingNav({ brand, links, cta, secondaryCta }: { brand: string; links: MarketingLink[]; cta: MarketingLink; secondaryCta?: MarketingLink }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <BrandMark className="size-8 text-sm" /> {brand}
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? 'page' : undefined} className={cn('rounded-lg px-3 py-2 text-sm font-medium hover:bg-surface hover:text-text', pathname === l.href ? 'text-text' : 'text-text-muted')}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {secondaryCta && (
            <Button variant="ghost" asChild>
              {/^https?:\/\//.test(secondaryCta.href) ? (
                <a href={secondaryCta.href} target="_blank" rel="noopener noreferrer">
                  {secondaryCta.label}
                  <IconRenderer name="ExternalLink" className="size-3.5" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              )}
            </Button>
          )}
          <Button asChild>
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
            <IconRenderer name="Menu" className="size-5" />
          </Button>
          <SheetContent side="right" aria-describedby={undefined}>
            <SheetHeader>
              <SheetTitle>{brand}</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
            </SheetHeader>
            <SheetBody className="space-y-1 py-2">
              {links.map((l) => (
                <SheetClose asChild key={l.href}>
                  <Link href={l.href} aria-current={pathname === l.href ? 'page' : undefined} className="flex min-h-11 items-center rounded-lg px-3 text-base font-medium hover:bg-canvas">
                    {l.label}
                  </Link>
                </SheetClose>
              ))}
              <Button asChild className="mt-4 w-full" size="lg">
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            </SheetBody>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function SectionShell({ id, eyebrow, title, description, children, className, align = 'center' }: { id?: string; eyebrow?: string; title: string; description?: string; children: React.ReactNode; className?: string; align?: 'center' | 'left' }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cn('mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24', className)}>
      <div className={cn('mb-10 max-w-2xl space-y-3 md:mb-14', align === 'center' && 'mx-auto text-center')}>
        {eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
        <h2 id={id ? `${id}-title` : undefined} className="text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h2>
        {description && <p className="text-lg text-text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}
