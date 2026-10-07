'use client';

import * as Popover from '@radix-ui/react-popover';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useTheme } from '@nexus/theme';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';
import { Avatar } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { BrandMark } from './brand-mark';
import { ThemeControls } from './theme-controls';

export interface ShellUser {
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string;
}

export interface TopBarProps {
  appName: string;
  user?: ShellUser | null;
  onOpenSearch: () => void;
  onSignOut?: () => void;
  /** Slot for the notification bell (feature-provided so data fetching stays out of the shell). */
  notifications?: ReactNode;
  /** Small status chip at the left (e.g. a "Demo data" badge). */
  statusChip?: ReactNode;
  /** Shown in the account menu when the browser offers installation. */
  onInstallApp?: () => void;
  profileHref?: string;
  settingsHref?: string;
  className?: string;
}

const iconButton =
  'grid size-10 place-items-center rounded-xl text-text-muted hover:bg-canvas hover:text-text data-[state=open]:bg-canvas data-[state=open]:text-primary [@media(pointer:coarse)]:size-11';

export function TopBar({ appName, user, onOpenSearch, onSignOut, notifications, statusChip, onInstallApp, profileHref = '/profile', settingsHref = '/settings', className }: TopBarProps) {
  const { resolvedMode, toggleMode } = useTheme();

  return (
    <header
      className={cn('sticky top-0 z-20 flex h-topbar items-center gap-2 border-b border-border bg-surface/90 px-3 pt-safe backdrop-blur-md md:gap-3 md:px-6', className)}
    >
      {/* Mobile brand (the sidebar is hidden below md) */}
      <Link href="/" className="flex items-center gap-2.5 md:hidden" aria-label={`${appName} home`}>
        <BrandMark className="size-9 text-base" />
        <span className="max-w-[9rem] truncate text-sm font-semibold tracking-tight">{appName}</span>
      </Link>
      {statusChip && <div className="hidden md:block">{statusChip}</div>}

      {/* Global search trigger */}
      <div className="mx-auto hidden w-full max-w-md md:block">
        <button
          type="button"
          onClick={onOpenSearch}
          aria-haspopup="dialog"
          aria-keyshortcuts="Control+K Meta+K"
          className="group flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border-strong bg-canvas px-3.5 text-sm text-text-muted hover:bg-canvas/70"
        >
          <span className="flex items-center gap-2.5 truncate">
            <IconRenderer name="Search" className="size-4" />
            Search pages and actions…
          </span>
          <kbd className="hidden items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 font-sans text-[11px] font-semibold lg:inline-flex">Ctrl K</kbd>
        </button>
      </div>

      <div className="ml-auto flex items-center gap-0.5 md:ml-0 md:gap-1">
        <button type="button" onClick={onOpenSearch} aria-label="Search" aria-haspopup="dialog" className={cn(iconButton, 'md:hidden')}>
          <IconRenderer name="Search" className="size-5" />
        </button>

        <button
          type="button"
          onClick={toggleMode}
          aria-label={`Switch to ${resolvedMode === 'dark' ? 'light' : 'dark'} mode`}
          className={iconButton}
        >
          <IconRenderer name={resolvedMode === 'dark' ? 'Sun' : 'Moon'} className="size-5" />
        </button>

        <Popover.Root>
          <Popover.Trigger asChild>
            <button type="button" aria-label="Theme settings" className={cn(iconButton, 'max-md:hidden')}>
              <IconRenderer name="Palette" className="size-5" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={8}
              collisionPadding={8}
              className="z-[60] max-h-[80dvh] w-80 overflow-y-auto rounded-card border border-border bg-surface-elevated p-4 text-text shadow-popover animate-pop-in custom-scrollbar"
            >
              <h2 className="mb-3 text-sm font-semibold">Appearance</h2>
              <ThemeControls />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {notifications}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="ml-1 flex items-center gap-2 rounded-xl p-1 hover:bg-canvas data-[state=open]:bg-canvas"
            >
              <Avatar name={user?.name ?? 'Guest'} src={user?.avatarUrl} />
              <span className="hidden text-left xl:block">
                <span className="block text-xs font-semibold leading-tight">{user?.name ?? 'Guest'}</span>
                {user?.role && <span className="block text-[11px] text-text-muted">{user.role}</span>}
              </span>
              <IconRenderer name="ChevronDown" className="mr-1 hidden size-3.5 text-text-muted xl:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60">
            {user && (
              <>
                <DropdownMenuLabel className="space-y-0.5 px-3 py-2">
                  <span className="block text-sm font-semibold text-text">{user.name}</span>
                  <span className="block truncate text-xs font-normal text-text-muted">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <Link href={profileHref}>
                <IconRenderer name="User" className="size-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={settingsHref}>
                <IconRenderer name="Settings" className="size-4" /> Settings
              </Link>
            </DropdownMenuItem>
            {onInstallApp && (
              <DropdownMenuItem onSelect={onInstallApp}>
                <IconRenderer name="Download" className="size-4" /> Install app
              </DropdownMenuItem>
            )}
            {onSignOut && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onSelect={onSignOut}>
                  <IconRenderer name="LogOut" className="size-4" /> Sign out
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
