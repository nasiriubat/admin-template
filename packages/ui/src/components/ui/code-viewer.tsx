'use client';

import { forwardRef, useEffect, useRef, useState, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';

export interface CodeViewerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  code: string;
  /** Shown as a caption chip, e.g. "bash". No syntax highlighting is bundled. */
  language?: string;
  lineNumbers?: boolean;
  /** Accessible name for the scrollable code region. */
  label?: string;
}

/** Monospace code block with a copy button. Scrollable region is focusable for keyboard users. */
export const CodeViewer = forwardRef<HTMLDivElement, CodeViewerProps>(function CodeViewer(
  { code, language, lineNumbers, label = 'Code', className, ...props },
  ref,
) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const lines = code.split('\n');
  return (
    <div ref={ref} className={cn('overflow-hidden rounded-card border border-border bg-canvas', className)} {...props}>
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
        <span className="font-mono text-xs text-text-muted">{language ?? 'text'}</span>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-text-muted hover:bg-surface hover:text-text [@media(pointer:coarse)]:min-h-11"
        >
          <IconRenderer name={copied ? 'Check' : 'Copy'} className="size-3.5" />
          {copied ? 'Copied' : 'Copy'}
          <span className="sr-only" role="status">
            {copied ? 'Code copied to clipboard' : ''}
          </span>
        </button>
      </div>
      <pre tabIndex={0} aria-label={label} className="max-h-96 overflow-auto p-3 font-mono text-[13px] leading-relaxed text-text">
        <code>
          {lineNumbers
            ? lines.map((line, i) => (
                <span key={i} className="flex">
                  <span aria-hidden="true" className="mr-4 w-8 shrink-0 select-none text-right text-text-muted">
                    {i + 1}
                  </span>
                  <span className="whitespace-pre">{line || ' '}</span>
                </span>
              ))
            : code}
        </code>
      </pre>
    </div>
  );
});
