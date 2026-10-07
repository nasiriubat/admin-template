'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';

export interface JsonViewerProps {
  data: unknown;
  /** Levels expanded on first render. */
  defaultExpandedDepth?: number;
  label?: string;
  className?: string;
}

function Primitive({ value }: { value: unknown }): ReactNode {
  if (value === null) return <span className="text-text-muted">null</span>;
  if (typeof value === 'string') return <span className="break-all text-success">&quot;{value}&quot;</span>;
  if (typeof value === 'number') return <span className="text-info">{String(value)}</span>;
  if (typeof value === 'boolean') return <span className="text-warning">{String(value)}</span>;
  return <span className="text-text-muted">{String(value)}</span>;
}

function Node({ name, value, depth, expandedDepth }: { name?: string; value: unknown; depth: number; expandedDepth: number }) {
  const [open, setOpen] = useState(depth < expandedDepth);
  const isObject = typeof value === 'object' && value !== null;
  const key = name !== undefined && <span className="text-primary">{name}: </span>;
  if (!isObject) {
    return (
      <li className="py-0.5 pl-6">
        {key}
        <Primitive value={value} />
      </li>
    );
  }
  const isArray = Array.isArray(value);
  const entries = isArray ? (value as unknown[]).map((v, i) => [String(i), v] as const) : Object.entries(value as object);
  const [openBracket, closeBracket] = isArray ? ['[', ']'] : ['{', '}'];
  return (
    <li className="py-0.5">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`${name ?? 'root'} ${isArray ? 'array' : 'object'}, ${entries.length} ${entries.length === 1 ? 'item' : 'items'}`}
        onClick={() => setOpen((o) => !o)}
        className="-ml-0.5 inline-flex items-center gap-1 rounded px-0.5 text-left hover:bg-surface [@media(pointer:coarse)]:min-h-11"
      >
        <IconRenderer name={open ? 'ChevronDown' : 'ChevronRight'} className="size-4 text-text-muted" />
        {key}
        <span className="text-text-muted">
          {openBracket}
          {!open && ` … ${entries.length} ${closeBracket}`}
          {open && entries.length === 0 && closeBracket}
        </span>
      </button>
      {open && entries.length > 0 && (
        <>
          <ul className="ml-3 border-l border-border pl-2">
            {entries.map(([k, v]) => (
              <Node key={k} name={k} value={v} depth={depth + 1} expandedDepth={expandedDepth} />
            ))}
          </ul>
          <span className="pl-6 text-text-muted">{closeBracket}</span>
        </>
      )}
    </li>
  );
}

/** Collapsible JSON tree. Every branch is a real button, so Tab/Enter/Space work without extra wiring. */
export function JsonViewer({ data, defaultExpandedDepth = 1, label = 'JSON data', className }: JsonViewerProps) {
  return (
    <div role="group" aria-label={label} className={cn('overflow-auto rounded-card border border-border bg-canvas p-3 font-mono text-[13px] leading-relaxed text-text', className)}>
      <ul>
        <Node value={data} depth={0} expandedDepth={defaultExpandedDepth} />
      </ul>
    </div>
  );
}
