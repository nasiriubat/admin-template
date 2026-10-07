'use client';

import { forwardRef, useId, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  /** Return `true` when valid, or an error message. Runs before a tag is added. */
  validate?: (tag: string, current: string[]) => true | string;
  /** Called when validation (or the duplicate/max check) rejects a tag. */
  onInvalid?: (tag: string, message: string) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

/**
 * Free-text tags. Enter or comma commits, Backspace on an empty field removes the last tag,
 * pasted comma-separated lists are split. Rejections are announced in a live region.
 */
export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(function TagInput(
  { value, onChange, validate, onInvalid, placeholder = 'Type and press Enter', maxTags, disabled, id, className, ...aria },
  ref,
) {
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');
  const msgId = useId();

  function reject(tag: string, text: string) {
    setMessage(text);
    onInvalid?.(tag, text);
  }

  function commit(raw: string) {
    const parts = raw.split(',').map((t) => t.trim()).filter(Boolean);
    let next = value;
    for (const tag of parts) {
      if (maxTags !== undefined && next.length >= maxTags) {
        reject(tag, `You can add up to ${maxTags} tags.`);
        if (next !== value) onChange(next);
        setDraft(tag);
        return;
      }
      if (next.some((t) => t.toLowerCase() === tag.toLowerCase())) {
        reject(tag, `“${tag}” is already added.`);
        continue;
      }
      const result = validate ? validate(tag, next) : true;
      if (result !== true) {
        reject(tag, result);
        continue;
      }
      next = [...next, tag];
      setMessage('');
    }
    if (next !== value) onChange(next);
    setDraft('');
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (draft.trim()) commit(draft);
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text');
    if (text.includes(',')) {
      e.preventDefault();
      commit(text);
    }
  }

  return (
    <div className={cn('space-y-1', className)}>
      <div
        data-disabled={disabled || undefined}
        aria-invalid={aria['aria-invalid']}
        className="flex min-h-input flex-wrap items-center gap-1.5 rounded-input border border-border-strong bg-surface px-2 py-1 text-sm focus-within:border-primary hover:border-text-muted aria-[invalid=true]:border-danger data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-canvas data-[disabled=true]:opacity-60"
      >
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-md border border-border bg-canvas py-0.5 pl-2 pr-0.5 text-xs font-medium text-text">
            {tag}
            <button
              type="button"
              disabled={disabled}
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="grid size-6 place-items-center rounded text-text-muted hover:bg-surface hover:text-text"
            >
              <IconRenderer name="X" className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={ref}
          id={id}
          value={draft}
          disabled={disabled}
          placeholder={value.length === 0 ? placeholder : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => draft.trim() && commit(draft)}
          aria-label={aria['aria-label']}
          aria-describedby={[aria['aria-describedby'], message ? msgId : null].filter(Boolean).join(' ') || undefined}
          aria-invalid={aria['aria-invalid']}
          aria-required={aria['aria-required']}
          className="h-8 min-w-24 flex-1 bg-transparent px-1 text-text placeholder:text-text-muted [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:text-base"
        />
      </div>
      <p id={msgId} role="status" aria-live="polite" className={cn('text-xs font-medium text-danger', !message && 'sr-only')}>
        {message}
      </p>
    </div>
  );
});
