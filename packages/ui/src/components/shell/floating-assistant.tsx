'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

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

/* The draggable widget itself lives in ./floating-assistant-widget so the shell can load it on demand. */
export interface AssistantAction {
  id: string;
  label: string;
  icon: string;
  onSelect?: () => void;
  href?: string;
  /** Open `href` in a new tab. */
  external?: boolean;
}
