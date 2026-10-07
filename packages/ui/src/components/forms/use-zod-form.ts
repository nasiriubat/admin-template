'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type FieldValues, type Path, type UseFormProps, type UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

/** React Hook Form wired to a Zod schema. All shared forms should be created through this. */
export function useZodForm<S extends z.ZodType<FieldValues, FieldValues>>(
  schema: S,
  options: Omit<UseFormProps<z.input<S>, unknown, z.output<S>>, 'resolver'> = {},
): UseFormReturn<z.input<S>, unknown, z.output<S>> {
  return useForm<z.input<S>, unknown, z.output<S>>({
    mode: 'onTouched',
    ...options,
    resolver: zodResolver(schema as never) as never,
  });
}

/**
 * Copy field-level errors from an API validation failure (`error.fields`) onto the form so the
 * server stays authoritative while users still get inline messages.
 */
export function applyServerErrors<T extends FieldValues>(form: UseFormReturn<T, unknown, never>, error: unknown): string | null {
  const e = error as { fields?: Record<string, string>; message?: string } | null;
  if (e?.fields) {
    for (const [name, message] of Object.entries(e.fields)) {
      form.setError(name as Path<T>, { type: 'server', message });
    }
    return null;
  }
  return e?.message ?? 'Something went wrong. Please try again.';
}

/** Warn before leaving the page (reload, close, or an in-app link) while a form has unsaved edits. */
export function useUnsavedChangesWarning(dirty: boolean, message = 'You have unsaved changes. Leave without saving?') {
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target === '_blank' || event.defaultPrevented) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin || url.pathname + url.search === location.pathname + location.search) return;
      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty, message]);
}
