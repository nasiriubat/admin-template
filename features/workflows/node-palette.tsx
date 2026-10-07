'use client';

import { cn, IconRenderer } from '@nexus/ui';
import { NODE_CATALOG, PALETTE_KINDS } from './node-catalog';
import type { NodeKind } from './types';

export const DRAG_MIME = 'application/x-nexus-workflow-node';

/**
 * Node palette. Every item is a real button: Enter or Space adds the node at the centre of the
 * canvas, and pointer users can also drag it onto the canvas.
 */
export function NodePalette({ onAdd, disabledKinds = [], className }: { onAdd: (kind: NodeKind) => void; disabledKinds?: NodeKind[]; className?: string }) {
  return (
    <nav aria-label="Node palette" className={cn('space-y-1', className)}>
      <p className="px-1 pb-1 text-xs text-text-muted">Click, press Enter, or drag a node onto the canvas.</p>
      <ul className="space-y-1">
        {PALETTE_KINDS.map((kind) => {
          const spec = NODE_CATALOG[kind];
          const disabled = disabledKinds.includes(kind);
          return (
            <li key={kind}>
              <button
                type="button"
                draggable={!disabled}
                disabled={disabled}
                aria-label={`Add ${spec.label} node`}
                title={disabled ? 'A workflow can have only one trigger.' : spec.description}
                onClick={() => onAdd(kind)}
                onDragStart={(e) => {
                  e.dataTransfer.setData(DRAG_MIME, kind);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                className="flex min-h-11 w-full cursor-grab items-center gap-2.5 rounded-input border border-border bg-surface px-2.5 py-2 text-left hover:border-border-strong hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50 active:cursor-grabbing"
              >
                <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', spec.tone)}><IconRenderer name={spec.icon} className="size-4" /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-text">{spec.label}</span>
                  <span className="block truncate text-xs text-text-muted">{spec.description}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
