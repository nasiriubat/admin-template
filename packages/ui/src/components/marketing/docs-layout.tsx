'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';
import { Button } from '../ui/button';
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/dialog';

export interface DocsNavGroup {
  title: string;
  items: Array<{ title: string; href: string }>;
}
export interface DocsPager {
  title: string;
  href: string;
}

function NavList({ groups, current, onNavigate }: { groups: DocsNavGroup[]; current?: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Documentation" className="space-y-6">
      {groups.map((g) => (
        <div key={g.title}>
          <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">{g.title}</h2>
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const active = item.href === current;
              const link = (
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn('flex min-h-9 items-center rounded-lg px-3 text-sm', active ? 'bg-primary/10 font-medium text-primary' : 'text-text-muted hover:bg-surface hover:text-text')}
                >
                  {item.title}
                </Link>
              );
              return <li key={item.href}>{onNavigate ? <SheetClose asChild>{link}</SheetClose> : link}</li>;
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Documentation shell: sticky sidebar on desktop, Sheet menu on mobile, "on this page" rail, prev/next. */
export function DocsLayout({ groups, current, toc, prev, next, children }: { groups: DocsNavGroup[]; current?: string; toc?: Array<{ id: string; title: string }>; prev?: DocsPager; next?: DocsPager; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_13rem] lg:py-12">
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2">
          <NavList groups={groups} current={current} />
        </div>
      </aside>

      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <Button variant="secondary" className="w-full justify-between" aria-expanded={open} onClick={() => setOpen(true)}>
            <span className="flex items-center gap-2">
              <IconRenderer name="Menu" className="size-4" /> Documentation menu
            </span>
            <IconRenderer name="ChevronRight" className="size-4" />
          </Button>
          <SheetContent side="left" aria-describedby={undefined}>
            <SheetHeader>
              <SheetTitle>Documentation</SheetTitle>
              <SheetDescription className="sr-only">Browse documentation pages</SheetDescription>
            </SheetHeader>
            <SheetBody>
              <NavList groups={groups} current={current} onNavigate={() => setOpen(false)} />
            </SheetBody>
          </SheetContent>
        </Sheet>
      </div>

      <div className="min-w-0 lg:col-start-2">
        {toc && toc.length > 0 && (
          <details className="group mb-8 rounded-card border border-border bg-surface p-4 xl:hidden">
            <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between text-sm font-medium [&::-webkit-details-marker]:hidden">
              On this page
              <IconRenderer name="ChevronDown" className="size-4 text-text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <ul className="mt-3 space-y-1 text-sm">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="flex min-h-9 items-center text-text-muted hover:text-text">
                    {t.title}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}
        {children}
        {(prev || next) && (
          <nav aria-label="Previous and next pages" className="mt-14 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
            {prev ? (
              <Link href={prev.href} rel="prev" className="flex flex-col rounded-card border border-border bg-surface p-4 hover:border-primary">
                <span className="text-xs text-text-muted">Previous</span>
                <span className="font-medium">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={next.href} rel="next" className="flex flex-col rounded-card border border-border bg-surface p-4 hover:border-primary sm:items-end sm:text-right">
                <span className="text-xs text-text-muted">Next</span>
                <span className="font-medium">{next.title}</span>
              </Link>
            )}
          </nav>
        )}
      </div>

      {toc && toc.length > 0 && (
        <aside className="hidden xl:col-start-3 xl:row-start-1 xl:block">
          <nav aria-label="On this page" className="sticky top-24 text-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">On this page</h2>
            <ul className="space-y-2 border-l border-border">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="-ml-px block border-l border-transparent pl-3 text-text-muted hover:border-primary hover:text-text">
                    {t.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}
    </div>
  );
}
