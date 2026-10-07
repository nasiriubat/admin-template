'use client';

import * as Popover from '@radix-ui/react-popover';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Kbd } from '../ui/kbd';

/* ------------------------------------------------------------- preferences */

export type AssistantSide = 'left' | 'right';

export interface AssistantPrefs {
  /** undefined = follow the deployment default */
  enabled?: boolean;
  side: AssistantSide;
  /** Vertical position as a fraction of the viewport height (0 top, 1 bottom). */
  y: number;
}

const STORAGE_KEY = 'nexus_assistant';
const EVENT = 'nexus:assistant-change';
const DEFAULT_PREFS: AssistantPrefs = { side: 'right', y: 0.8 };
let cached: { raw: string | null; value: AssistantPrefs } = { raw: null, value: DEFAULT_PREFS };

function read(): AssistantPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cached.raw) return cached.value;
    const parsed = raw ? (JSON.parse(raw) as Partial<AssistantPrefs>) : {};
    const value: AssistantPrefs = {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : undefined,
      side: parsed.side === 'left' ? 'left' : 'right',
      y: typeof parsed.y === 'number' && parsed.y >= 0 && parsed.y <= 1 ? parsed.y : DEFAULT_PREFS.y,
    };
    cached = { raw, value };
    return value;
  } catch {
    return DEFAULT_PREFS;
  }
}

function write(patch: Partial<AssistantPrefs>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...read(), ...patch }));
  } catch {
    // Storage unavailable: preference lasts for this session only.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function useAssistantPrefs() {
  const prefs = useSyncExternalStore(subscribe, read, () => DEFAULT_PREFS);
  return [prefs, write] as const;
}

/* ----------------------------------------------------------------- context */

export interface AssistantControl {
  /** Effective on/off state (user choice, else deployment default). */
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const AssistantContext = createContext<AssistantControl | null>(null);

/** Returns null outside an AppShell with the assistant available, so callers can hide their toggle. */
export function useAssistant(): AssistantControl | null {
  return useContext(AssistantContext);
}

export function AssistantProvider({ enabledByDefault, children }: { enabledByDefault: boolean; children: ReactNode }) {
  const [prefs, update] = useAssistantPrefs();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const enabled = mounted ? (prefs.enabled ?? enabledByDefault) : false; // avoids an SSR/hydration mismatch
  const value = useMemo<AssistantControl>(() => ({ enabled, setEnabled: (next) => update({ enabled: next }) }), [enabled, update]);
  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

/* ------------------------------------------------------------------ widget */

export interface AssistantAction {
  id: string;
  label: string;
  icon: string;
  onSelect?: () => void;
  href?: string;
  /** Open `href` in a new tab. */
  external?: boolean;
}

const SHORTCUTS: Array<[string, string]> = [
  ['Ctrl/⌘ K', 'Open search and commands'],
  ['Ctrl/⌘ B', 'Collapse or expand the sidebar'],
  ['Esc', 'Close dialogs, menus and sheets'],
  ['Tab / Shift Tab', 'Move between controls'],
];

const SIZE = 56;
const MARGIN = 12;
const DRAG_THRESHOLD = 6;

export function FloatingAssistant({ actions }: { actions: AssistantAction[] }) {
  const [prefs, update] = useAssistantPrefs();
  const [open, setOpen] = useState(false);
  const [help, setHelp] = useState(false);
  const [dragY, setDragY] = useState<number | null>(null);
  const [dragX, setDragX] = useState<number | null>(null);
  const drag = useRef<{ startX: number; startY: number; moved: boolean; pointerId: number } | null>(null);
  const suppressClick = useRef(false);

  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const measure = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const bottomReserve = viewport.w < 768 ? 88 : MARGIN; // keep clear of the mobile bottom navigation
  const top = dragY ?? Math.min(Math.max(prefs.y * viewport.h - SIZE / 2, MARGIN), Math.max(viewport.h - SIZE - bottomReserve, MARGIN));
  const style =
    dragX !== null
      ? { top, left: dragX }
      : prefs.side === 'left'
        ? { top, left: MARGIN }
        : { top, right: MARGIN };

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, moved: false, pointerId: e.pointerId };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < DRAG_THRESHOLD) return;
    d.moved = true;
    if (open) setOpen(false);
    setDragX(Math.min(Math.max(e.clientX - SIZE / 2, 0), viewport.w - SIZE));
    setDragY(Math.min(Math.max(e.clientY - SIZE / 2, 0), viewport.h - SIZE));
  };
  const finishDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) {
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 0);
      update({ side: e.clientX < viewport.w / 2 ? 'left' : 'right', y: Math.min(Math.max(e.clientY / viewport.h, 0.08), 0.95) });
    }
    setDragX(null);
    setDragY(null);
  };

  const moveTo = useCallback((side: AssistantSide, y: number) => update({ side, y }), [update]);

  const run = (a: AssistantAction) => {
    setOpen(false);
    if (a.href) {
      if (a.external) window.open(a.href, '_blank', 'noopener,noreferrer');
      else window.location.assign(a.href);
    } else a.onSelect?.();
  };

  const builtin: AssistantAction[] = [
    { id: 'top', label: 'Scroll to top', icon: 'ArrowUp', onSelect: () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) },
    { id: 'help', label: 'Keyboard shortcuts', icon: 'Keyboard', onSelect: () => setHelp(true) },
  ];
  const all = [...actions, ...builtin];

  if (viewport.w === 0) return null;

  return (
    <>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Anchor asChild>
          <div className="fixed z-[45] touch-none" style={{ ...style, width: SIZE, height: SIZE }}>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label="Quick actions assistant"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
                onClick={(e) => {
                  if (suppressClick.current) e.preventDefault();
                }}
                className={cn(
                  'grid size-14 cursor-grab place-items-center rounded-full border border-border bg-surface-elevated text-primary shadow-popover',
                  'transition-[transform,box-shadow] duration-150 hover:scale-105 active:cursor-grabbing active:scale-95 motion-reduce:transition-none',
                  'data-[state=open]:bg-primary data-[state=open]:text-primary-foreground',
                  dragY !== null && 'cursor-grabbing scale-105',
                )}
              >
                <span className="grid size-10 place-items-center rounded-full bg-primary/15 data-[state=open]:bg-transparent">
                  <IconRenderer name="Sparkles" className="size-5" />
                </span>
              </button>
            </Popover.Trigger>
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            side={prefs.side === 'right' ? 'left' : 'right'}
            align="center"
            sideOffset={12}
            collisionPadding={12}
            className="z-[60] w-[min(18rem,calc(100vw-5.5rem))] rounded-card border border-border bg-surface-elevated p-3 text-text shadow-popover animate-pop-in"
          >
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Quick actions</p>
            <ul className="grid grid-cols-3 gap-2">
              {all.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => run(a)}
                    className="flex min-h-[4.25rem] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-canvas p-2 text-center text-[11px] font-medium leading-tight text-text hover:border-primary hover:text-primary"
                  >
                    <IconRenderer name={a.icon} className="size-5" />
                    <span>{a.label}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-border pt-3">
              <p className="px-1 pb-1.5 text-[11px] font-medium text-text-muted">Move assistant</p>
              <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Move assistant to a screen position">
                {(
                  [
                    ['left', 0.15, 'Top left'],
                    ['right', 0.15, 'Top right'],
                    ['left', 0.8, 'Bottom left'],
                    ['right', 0.8, 'Bottom right'],
                  ] as const
                ).map(([side, y, label]) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    title={label}
                    onClick={() => moveTo(side, y)}
                    className="grid min-h-9 place-items-center rounded-lg border border-border bg-canvas text-text-muted hover:text-text [@media(pointer:coarse)]:min-h-11"
                  >
                    <IconRenderer name={side === 'left' ? 'ArrowLeft' : 'ArrowRight'} className={cn('size-4', (side === 'left') === (y < 0.5) ? 'rotate-45' : '-rotate-45')} />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  update({ enabled: false });
                  setOpen(false);
                }}
                className="mt-3 flex min-h-9 w-full items-center justify-center gap-2 rounded-lg text-xs font-medium text-text-muted hover:bg-canvas hover:text-text"
              >
                <IconRenderer name="EyeOff" className="size-4" /> Hide assistant
                <span className="sr-only"> (turn it back on in the account menu)</span>
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>Everything in the app can be used without a mouse.</DialogDescription>
          </DialogHeader>
          <DialogBody className="pb-5">
            <dl className="divide-y divide-border text-sm">
              {SHORTCUTS.map(([keys, what]) => (
                <div key={keys} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-text-muted">{what}</dt>
                  <dd>
                    <Kbd>{keys}</Kbd>
                  </dd>
                </div>
              ))}
            </dl>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}
