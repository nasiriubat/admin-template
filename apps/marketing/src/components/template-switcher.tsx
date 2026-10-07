'use client';

import * as Popover from '@radix-ui/react-popover';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconRenderer } from '@nexus/ui/marketing';
import { templateByPath, templates } from '../lib/templates';
import { TemplatePreview } from './template-preview';

/**
 * Floating "Templates" button: jump between the landing page templates without leaving the page.
 * Hide it for a production site with NEXT_PUBLIC_TEMPLATE_SWITCHER=off.
 */
export function TemplateSwitcher() {
  const pathname = usePathname();
  if (process.env.NEXT_PUBLIC_TEMPLATE_SWITCHER === 'off') return null;
  const current = templateByPath(pathname);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="fixed bottom-4 left-4 z-30 flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium text-text shadow-popover hover:border-primary data-[state=open]:border-primary"
        >
          <IconRenderer name="Layout" className="size-4 text-primary" />
          Templates
          {current && <span className="hidden text-text-muted sm:inline">· {current.name}</span>}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="top" align="start" sideOffset={10} collisionPadding={12} className="z-[60] w-[min(26rem,calc(100vw-1.5rem))] rounded-card border border-border bg-surface-elevated p-3 text-text shadow-popover animate-pop-in">
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-sm font-semibold">Landing page templates</p>
            <Popover.Close asChild>
              <Link href="/templates" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            </Popover.Close>
          </div>
          <ul className="grid max-h-[60dvh] grid-cols-2 gap-2 overflow-y-auto">
            {templates.map((t) => {
              const active = current?.id === t.id;
              return (
                <li key={t.id}>
                  <Popover.Close asChild>
                    <Link href={t.path} aria-current={active ? 'page' : undefined} className={`block overflow-hidden rounded-xl border bg-canvas hover:border-primary ${active ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
                      <span className="block aspect-[4/3] bg-canvas">
                        <TemplatePreview template={t} />
                      </span>
                      <span className="block px-2.5 py-2">
                        <span className="block text-sm font-semibold">{t.name}</span>
                        <span className="block text-[11px] leading-tight text-text-muted">{t.bestFor}</span>
                      </span>
                    </Link>
                  </Popover.Close>
                </li>
              );
            })}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
