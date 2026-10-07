import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';

const control = [
  'w-full rounded-input border border-border-strong bg-surface px-3 text-sm text-text',
  'placeholder:text-text-muted transition-colors',
  'hover:border-text-muted focus-visible:border-primary focus-visible:outline-offset-0',
  'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-canvas',
  'read-only:bg-canvas',
  'aria-[invalid=true]:border-danger',
  '[@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:text-base',
];

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, type = 'text', ...props },
  ref,
) {
  return <input ref={ref} type={type} className={cn(control, 'h-input', className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, rows = 4, ...props }, ref) {
    return <textarea ref={ref} rows={rows} className={cn(control, 'py-2 min-h-20', className)} {...props} />;
  },
);

/** Native select: best mobile UX and fully keyboard/screen-reader accessible. */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(control, 'h-input appearance-none pr-9', className)} {...props}>
        {children}
      </select>
      <IconRenderer
        name="ChevronDown"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
      />
    </div>
  );
});

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name; defaults to the placeholder. */
  label?: string;
}

export function SearchInput({ value, onValueChange, label, className, placeholder = 'Search…', ...props }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <IconRenderer name="Search" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      <input
        type="search"
        role="searchbox"
        aria-label={label ?? placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(control, 'h-input pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden')}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => onValueChange('')}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-text-muted hover:bg-canvas hover:text-text"
        >
          <IconRenderer name="X" className="size-4" />
        </button>
      )}
    </div>
  );
}
