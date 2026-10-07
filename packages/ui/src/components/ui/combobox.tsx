'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Command } from 'cmdk';
import { useId, useState } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface BaseProps {
  options: ComboboxOption[];
  id?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  /** Show a clear button when there is a selection (default true). */
  clearable?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

export interface ComboboxProps extends BaseProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export interface MultiSelectProps extends BaseProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const shell = [
  'flex min-h-input w-full flex-wrap items-center gap-1.5 rounded-input border border-border-strong bg-surface px-2 py-1 text-sm text-text',
  'hover:border-text-muted focus-within:border-primary aria-[invalid=true]:border-danger',
  'data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60 data-[disabled=true]:bg-canvas',
  '[@media(pointer:coarse)]:min-h-11',
];

interface CoreProps extends BaseProps {
  selected: string[];
  multiple: boolean;
  onToggle: (value: string) => void;
  onClear: () => void;
  onRemove: (value: string) => void;
}

function ComboboxCore(props: CoreProps) {
  const { options, selected, multiple, onToggle, onClear, onRemove, placeholder = 'Select…', searchPlaceholder = 'Search…', emptyText = 'No results found.', disabled, clearable = true, className } = props;
  const [open, setOpen] = useState(false);
  const listId = useId();
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  const hasValue = selected.length > 0;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Anchor asChild>
        <div className={cn(shell, className)} aria-invalid={props['aria-invalid']} data-disabled={disabled || undefined}>
          {multiple &&
            selected.map((v) => (
              <span key={v} className="inline-flex items-center gap-1 rounded-md border border-border bg-canvas py-0.5 pl-2 pr-0.5 text-xs font-medium text-text">
                {labelOf(v)}
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Remove ${labelOf(v)}`}
                  onClick={() => onRemove(v)}
                  className="grid size-6 place-items-center rounded text-text-muted hover:bg-surface hover:text-text"
                >
                  <IconRenderer name="X" className="size-3" />
                </button>
              </span>
            ))}
          <PopoverPrimitive.Trigger asChild>
            <button
              type="button"
              role="combobox"
              id={props.id}
              disabled={disabled}
              aria-expanded={open}
              aria-controls={open ? listId : undefined}
              aria-haspopup="listbox"
              aria-label={props['aria-label']}
              aria-describedby={props['aria-describedby']}
              aria-invalid={props['aria-invalid']}
              aria-required={props['aria-required']}
              className="flex h-8 min-w-24 flex-1 items-center justify-between gap-2 rounded px-1 text-left"
            >
              <span className={cn('truncate', (!hasValue || multiple) && 'text-text-muted')}>
                {multiple || !hasValue ? (multiple && hasValue ? 'Add more…' : placeholder) : labelOf(selected[0])}
              </span>
              <IconRenderer name="ChevronsUpDown" className="size-4 shrink-0 text-text-muted" />
            </button>
          </PopoverPrimitive.Trigger>
          {clearable && hasValue && !disabled && (
            <button
              type="button"
              aria-label="Clear selection"
              onClick={onClear}
              className="grid size-7 shrink-0 place-items-center rounded-md text-text-muted hover:bg-canvas hover:text-text"
            >
              <IconRenderer name="X" className="size-4" />
            </button>
          )}
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-56 overflow-hidden rounded-card border border-border bg-surface-elevated text-text shadow-popover"
        >
          <Command>
            <div className="border-b border-border p-2">
              <Command.Input
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-9 w-full rounded-input border border-border-strong bg-surface px-3 text-sm placeholder:text-text-muted [@media(pointer:coarse)]:min-h-11"
              />
            </div>
            <Command.List id={listId} className="max-h-60 overflow-auto p-1">
              <Command.Empty className="px-3 py-6 text-center text-sm text-text-muted">{emptyText}</Command.Empty>
              {options.map((o) => {
                const isSelected = selected.includes(o.value);
                return (
                  <Command.Item
                    key={o.value}
                    value={o.value}
                    keywords={[o.label]}
                    disabled={o.disabled}
                    onSelect={() => {
                      onToggle(o.value);
                      if (!multiple) setOpen(false);
                    }}
                    className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 text-sm data-[disabled=true]:opacity-50 data-[selected=true]:bg-canvas [@media(pointer:coarse)]:min-h-11"
                  >
                    <IconRenderer name="Check" className={cn('size-4 text-primary', !isSelected && 'invisible')} />
                    {o.label}
                  </Command.Item>
                );
              })}
            </Command.List>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

/** Searchable single-select. Use native `Select` for short lists; this when options need filtering. */
export function Combobox({ value, onChange, ...rest }: ComboboxProps) {
  return (
    <ComboboxCore
      {...rest}
      multiple={false}
      selected={value ? [value] : []}
      onToggle={(v) => onChange(v === value ? null : v)}
      onClear={() => onChange(null)}
      onRemove={() => onChange(null)}
    />
  );
}

/** Searchable multi-select showing the selection as removable tags. */
export function MultiSelect({ value, onChange, ...rest }: MultiSelectProps) {
  return (
    <ComboboxCore
      {...rest}
      multiple
      selected={value}
      onToggle={(v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])}
      onClear={() => onChange([])}
      onRemove={(v) => onChange(value.filter((x) => x !== v))}
    />
  );
}
