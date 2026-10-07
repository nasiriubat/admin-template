'use client';

import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { NavGroupConfig } from '@nexus/config';
import { useTheme } from '@nexus/theme';
import { IconRenderer } from '../icons/icon-renderer';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';

export interface PaletteAction {
  id: string;
  label: string;
  icon: string;
  keywords?: string[];
  run: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: NavGroupConfig[];
  /** Extra actions such as "Invite user" contributed by modules. */
  actions?: PaletteAction[];
  onSignOut?: () => void;
}

/** Ctrl/⌘ K command palette: fuzzy navigation + actions, fully keyboard operable (cmdk + Radix Dialog). */
export function CommandPalette({ open, onOpenChange, groups, actions = [], onSignOut }: CommandPaletteProps) {
  const router = useRouter();
  const { toggleMode, resolvedMode } = useTheme();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!open) setValue('');
  }, [open]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const item = 'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text aria-selected:bg-canvas [@media(pointer:coarse)]:min-h-11';
  const heading = '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-muted';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="top-[20%] translate-y-0 overflow-hidden p-0 [&>button[aria-label=Close]]:hidden max-sm:top-[8%]">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Search pages and run actions. Use arrow keys to move and Enter to select.</DialogDescription>
        <Command label="Command palette" loop>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <IconRenderer name="Search" className="size-5 shrink-0 text-text-muted" />
            <Command.Input
              value={value}
              onValueChange={setValue}
              placeholder="Search pages and actions…"
              className="h-14 flex-1 bg-transparent text-base text-text placeholder:text-text-muted focus:outline-none"
            />
            <kbd className="rounded border border-border bg-canvas px-1.5 py-0.5 text-[11px] font-semibold text-text-muted max-sm:hidden">Esc</kbd>
          </div>
          <Command.List className="max-h-[min(24rem,60dvh)] overflow-y-auto p-2 custom-scrollbar">
            <Command.Empty className="px-4 py-10 text-center text-sm text-text-muted">No results for “{value}”.</Command.Empty>
            {groups.map((group) => (
              <Command.Group key={group.id} heading={group.title} className={heading}>
                {group.items.map((nav) => (
                  <Command.Item key={nav.id} value={`${group.title} ${nav.label}`} onSelect={() => go(nav.href)} className={item}>
                    <span className="grid size-8 place-items-center rounded-lg border border-border bg-canvas text-text-muted">
                      <IconRenderer name={nav.icon} className="size-4" />
                    </span>
                    {nav.label}
                    <IconRenderer name="CornerDownLeft" className="ml-auto size-3.5 text-text-muted opacity-0 [[aria-selected=true]_&]:opacity-100" />
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
            <Command.Group heading="Actions" className={heading}>
              {actions.map((a) => (
                <Command.Item key={a.id} value={`${a.label} ${a.keywords?.join(' ') ?? ''}`} onSelect={() => { onOpenChange(false); a.run(); }} className={item}>
                  <IconRenderer name={a.icon} className="size-4 text-text-muted" /> {a.label}
                </Command.Item>
              ))}
              <Command.Item value="toggle theme dark light mode appearance" onSelect={() => { toggleMode(); onOpenChange(false); }} className={item}>
                <IconRenderer name={resolvedMode === 'dark' ? 'Sun' : 'Moon'} className="size-4 text-text-muted" />
                Switch to {resolvedMode === 'dark' ? 'light' : 'dark'} mode
              </Command.Item>
              {onSignOut && (
                <Command.Item value="sign out log out" onSelect={() => { onOpenChange(false); onSignOut(); }} className={item}>
                  <IconRenderer name="LogOut" className="size-4 text-text-muted" /> Sign out
                </Command.Item>
              )}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
