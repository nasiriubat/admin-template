'use client';

import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Input } from './input';
import { Label } from './label';

/**
 * Native date input (best mobile UX, keyboard and screen reader support for free) with the
 * shared control styling. `min` / `max` use the ISO `YYYY-MM-DD` format.
 */
export const DatePicker = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>>(function DatePicker(
  { className, ...props },
  ref,
) {
  return <Input ref={ref} type="date" className={cn('min-w-40 [color-scheme:light] dark:[color-scheme:dark]', className)} {...props} />;
});

export interface DateRange {
  from: string;
  to: string;
}

export interface DateRangeInputProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  min?: string;
  max?: string;
  fromLabel?: string;
  toLabel?: string;
  disabled?: boolean;
  className?: string;
}

/** Two date inputs that explain themselves when "from" is after "to". Empty bounds are allowed. */
export function DateRangeInput({ value, onChange, min, max, fromLabel = 'From', toLabel = 'To', disabled, className }: DateRangeInputProps) {
  const errorId = useId();
  const invalid = Boolean(value.from && value.to && value.from > value.to);
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${errorId}-from`}>{fromLabel}</Label>
          <DatePicker
            id={`${errorId}-from`}
            value={value.from}
            min={min}
            max={value.to && value.to < (max ?? '9999') ? value.to : max}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${errorId}-to`}>{toLabel}</Label>
          <DatePicker
            id={`${errorId}-to`}
            value={value.to}
            min={value.from && value.from > (min ?? '') ? value.from : min}
            max={max}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
          />
        </div>
      </div>
      {invalid && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {fromLabel} date must be on or before {toLabel.toLowerCase()} date.
        </p>
      )}
    </div>
  );
}
