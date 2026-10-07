import { Fragment, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';

export type ContentBlock =
  | { type: 'h2' | 'h3' | 'p' | 'quote'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'code'; code: string; language?: string }
  | { type: 'callout'; tone?: 'info' | 'warning'; title?: string; text: string };

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Level-2 headings of a document, for an "On this page" list. */
export function extractHeadings(blocks: ContentBlock[]): Array<{ id: string; title: string }> {
  return blocks.flatMap((b) => (b.type === 'h2' ? [{ id: slugify(b.text), title: b.text.replace(/`/g, '') }] : []));
}

/** Supports `inline code` only: content stays plain data and nothing is injected as HTML. */
export function renderInline(text: string): ReactNode {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') && part.length > 2 ? (
      <code key={i} className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[0.9em] text-text">
        {part.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Token-driven article typography used by the blog, docs and legal pages. */
export function ContentBlocks({ blocks, className }: { blocks: ContentBlock[]; className?: string }) {
  return (
    <div className={cn('space-y-5 text-base leading-7 text-text', className)}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'h2':
            return (
              <h2 key={i} id={slugify(b.text)} className="scroll-mt-24 pt-6 text-2xl font-semibold tracking-tight">
                {renderInline(b.text)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={i} id={slugify(b.text)} className="scroll-mt-24 pt-2 text-lg font-semibold">
                {renderInline(b.text)}
              </h3>
            );
          case 'p':
            return <p key={i}>{renderInline(b.text)}</p>;
          case 'quote':
            return (
              <blockquote key={i} className="border-l-4 border-primary pl-4 text-lg italic text-text-muted">
                {renderInline(b.text)}
              </blockquote>
            );
          case 'ul':
          case 'ol': {
            const List = b.type;
            return (
              <List key={i} className={cn('space-y-2 pl-6', b.type === 'ul' ? 'list-disc' : 'list-decimal')}>
                {b.items.map((item) => (
                  <li key={item} className="pl-1 marker:text-text-muted">
                    {renderInline(item)}
                  </li>
                ))}
              </List>
            );
          }
          case 'code':
            return (
              <pre key={i} tabIndex={0} aria-label={b.language ? `${b.language} code sample` : 'Code sample'} className="overflow-x-auto rounded-card border border-border bg-surface p-4 font-mono text-sm leading-6">
                <code>{b.code}</code>
              </pre>
            );
          case 'callout':
            return (
              <aside key={i} className={cn('flex gap-3 rounded-card border p-4 text-sm', b.tone === 'warning' ? 'border-warning/30 bg-warning/10' : 'border-info/30 bg-info/10')}>
                <IconRenderer name={b.tone === 'warning' ? 'AlertTriangle' : 'Info'} className={cn('mt-0.5 size-4 shrink-0', b.tone === 'warning' ? 'text-warning' : 'text-info')} />
                <div>
                  {b.title && <p className="font-semibold">{b.title}</p>}
                  <p className="text-text-muted">{renderInline(b.text)}</p>
                </div>
              </aside>
            );
        }
      })}
    </div>
  );
}

/** Persistent banner for legal templates. Remove once counsel has approved the text. */
export function TemplateBanner({ children = 'Template: have counsel review before publishing.' }: { children?: ReactNode }) {
  return (
    <div role="note" className="flex items-start gap-3 rounded-card border border-warning/40 bg-warning/10 p-4 text-sm">
      <IconRenderer name="AlertTriangle" className="mt-0.5 size-4 shrink-0 text-warning" />
      <p className="font-medium">{children}</p>
    </div>
  );
}
