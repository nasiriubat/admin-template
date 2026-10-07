'use client';

import { m } from 'framer-motion';
import { useId, useRef, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { useRevealPhase } from './shared';
import { toneStroke, toneFill, type Tone } from './tones';

export interface PipelineNode {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  /** Position as percent (0-100) of the diagram width/height (node centre). */
  x: number;
  y: number;
  tone?: Tone;
}

export interface PipelineEdge {
  from: string;
  to: string;
  /** Spoken/visible label for the connection in the text alternative. */
  label?: string;
}

export interface PipelineDiagramProps {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  /** Accessible title; the text alternative lists every node and connection. */
  title: string;
  /** Show dots travelling along each edge (omitted under reduced motion). */
  travellingDots?: boolean;
  /** Diagram aspect ratio at md+ (width / height). */
  aspect?: number;
  edgeTone?: Tone;
  className?: string;
}

const W = 800;

/**
 * Nodes joined by paths that draw on view, with dots travelling along them. At md+ it renders the
 * visual diagram (aria-hidden) and a screen-reader list; below md it shows the same steps as a
 * readable ordered list instead of a squeezed diagram.
 */
export function PipelineDiagram({ nodes, edges, title, travellingDots = true, aspect = 2.2, edgeTone = 'primary', className }: PipelineDiagramProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const { phase, reduced } = useRevealPhase(ref, { amount: 0.3 });
  const H = W / aspect;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edgePaths = edges.flatMap((e, i) => {
    const a = byId.get(e.from);
    const b = byId.get(e.to);
    if (!a || !b) return [];
    const [x1, y1, x2, y2] = [(a.x * W) / 100, (a.y * H) / 100, (b.x * W) / 100, (b.y * H) / 100];
    const mx = (x1 + x2) / 2;
    return [{ id: `${uid}-e${i}`, d: `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}` }];
  });
  const drawn = phase !== 'hidden';
  const outgoing = (id: string) => edges.filter((e) => e.from === id).map((e) => `${byId.get(e.to)?.label ?? e.to}${e.label ? ` (${e.label})` : ''}`);

  return (
    <figure className={className}>
      <figcaption className="sr-only">{title}</figcaption>
      <ol className="space-y-3 md:sr-only" data-testid="pipeline-list">
        {nodes.map((n, i) => (
          <li key={n.id} className="flex items-start gap-3 rounded-card border border-border bg-surface p-4">
            <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {n.icon ?? i + 1}
            </span>
            <span className="min-w-0">
              <span className="block font-medium text-text">{n.label}</span>
              {n.description && <span className="block text-sm text-text-muted">{n.description}</span>}
              {outgoing(n.id).length > 0 && <span className="sr-only">{`Connects to ${outgoing(n.id).join(', ')}.`}</span>}
            </span>
          </li>
        ))}
      </ol>

      <div ref={ref} aria-hidden="true" className="relative hidden w-full md:block" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} focusable="false" className="absolute inset-0 size-full">
          {edgePaths.map((p, i) => (
            <g key={p.id}>
              <m.path
                id={p.id}
                d={p.d}
                fill="none"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="1 0"
                className={toneStroke[edgeTone]}
                initial={false}
                animate={{ pathLength: drawn ? 1 : 0, opacity: drawn ? 0.7 : 0 }}
                transition={{ duration: phase === 'hidden' ? 0 : 1.1, delay: i * 0.15, ease: 'easeInOut' }}
              />
              {travellingDots && !reduced && drawn && (
                <circle r={4} className={toneFill[edgeTone]}>
                  <animateMotion dur={`${3 + (i % 3) * 0.6}s`} begin={`${1.2 + i * 0.15}s`} repeatCount="indefinite">
                    <mpath href={`#${p.id}`} />
                  </animateMotion>
                </circle>
              )}
            </g>
          ))}
        </svg>
        {nodes.map((n) => (
          <div
            key={n.id}
            className="absolute flex w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-card border border-border bg-surface-elevated p-3 text-center shadow-card"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            {n.icon && <span className={cn('text-primary')}>{n.icon}</span>}
            <span className="text-sm font-semibold text-text">{n.label}</span>
            {n.description && <span className="text-xs text-text-muted">{n.description}</span>}
          </div>
        ))}
      </div>
    </figure>
  );
}

/** Convenience export for a single self-drawing line (e.g. connectors between custom elements). */
export function AnimatedPath({ d, tone = 'primary', strokeWidth = 2, viewBox, className, delay = 0, duration = 1.2 }: { d: string; tone?: Tone; strokeWidth?: number; viewBox: string; className?: string; delay?: number; duration?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const { phase } = useRevealPhase(ref, { amount: 0.4 });
  return (
    <svg ref={ref} aria-hidden="true" focusable="false" viewBox={viewBox} className={className}>
      <m.path
        d={d}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={toneStroke[tone]}
        initial={false}
        animate={{ pathLength: phase === 'hidden' ? 0 : 1 }}
        transition={{ duration: phase === 'hidden' ? 0 : duration, delay, ease: 'easeInOut' }}
      />
    </svg>
  );
}
