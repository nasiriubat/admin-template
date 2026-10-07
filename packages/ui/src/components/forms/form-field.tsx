'use client';

import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Label } from '../ui/label';

export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

export interface FormFieldProps {
  label: string;
  hint?: ReactNode;
  /** Error message text. Presence marks the control invalid and is announced to screen readers. */
  error?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  /** A control element (Input/Select/…) or a render function receiving the a11y props. */
  children: ReactElement | ((props: FieldControlProps) => ReactNode);
}

/**
 * Field anatomy from docs/FORMS.md: label, optional marker, help text, control and error message,
 * wired together with ids so assistive tech reads them as one unit.
 */
export function FormField({ label, hint, error, required, optional, className, children }: FormFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  const controlProps: FieldControlProps = {
    id,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
    'aria-required': required || undefined,
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id} required={required} optional={optional && !required}>
        {label}
      </Label>
      {typeof children === 'function'
        ? children(controlProps)
        : isValidElement(children)
          ? cloneElement(children as ReactElement<Record<string, unknown>>, { ...controlProps, ...(children.props as object) , id })
          : children}
      {hint && !error && (
        <p id={hintId} className="text-xs text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** Group of related fields with a heading, for sectioned long forms. */
export function FormSection({ title, description, children, className }: { title: string; description?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <fieldset className={cn('grid gap-5 border-t border-border pt-6 first:border-t-0 first:pt-0 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-8', className)}>
      <legend className="sr-only">{title}</legend>
      <div aria-hidden="true">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </fieldset>
  );
}
