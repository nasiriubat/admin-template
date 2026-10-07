'use client';

import { useState, type KeyboardEvent } from 'react';
import { cn, IconRenderer } from '@nexus/ui';
import { isValidDomain, normalizeDomain } from './schemas';

/**
 * Domain tag input: type a domain and press Enter, comma or Tab-out to add it; Backspace on an
 * empty field removes the last one. Chips have their own remove buttons for pointer and touch.
 */
export function DomainTagInput({
  id,
  value,
  onChange,
  disabled,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
}: {
  id?: string;
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}) {
  const [draft, setDraft] = useState('');
  const [problem, setProblem] = useState<string | null>(null);

  function commit() {
    const raw = draft.trim();
    if (!raw) return;
    const domain = normalizeDomain(raw);
    if (!isValidDomain(domain)) return setProblem(`“${raw}” is not a valid domain, for example example.com.`);
    if (value.includes(domain)) return setProblem(`${domain} is already in the list.`);
    setProblem(null);
    setDraft('');
    onChange([...value, domain]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          'flex min-h-input flex-wrap items-center gap-1.5 rounded-input border border-border-strong bg-surface px-2 py-1.5',
          'focus-within:border-primary focus-within:outline focus-within:outline-2 focus-within:outline-primary',
          invalid && 'border-danger',
          disabled && 'cursor-not-allowed bg-canvas opacity-60',
        )}
      >
        {value.map((domain) => (
          <span key={domain} className="inline-flex items-center gap-1 rounded-full border border-border bg-canvas py-0.5 pl-2.5 pr-1 text-xs font-medium text-text">
            {domain}
            <button
              type="button"
              disabled={disabled}
              aria-label={`Remove ${domain}`}
              onClick={() => onChange(value.filter((d) => d !== domain))}
              className="grid size-5 place-items-center rounded-full text-text-muted hover:bg-border hover:text-text [@media(pointer:coarse)]:size-8"
            >
              <IconRenderer name="X" className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          disabled={disabled}
          onChange={(e) => {
            setDraft(e.target.value);
            setProblem(null);
          }}
          onKeyDown={onKeyDown}
          onBlur={commit}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          placeholder={value.length ? 'Add another' : 'example.com'}
          inputMode="url"
          autoComplete="off"
          className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm text-text outline-none placeholder:text-text-muted [@media(pointer:coarse)]:text-base"
        />
      </div>
      {problem && (
        <p role="alert" className="text-xs font-medium text-danger">
          {problem}
        </p>
      )}
    </div>
  );
}
