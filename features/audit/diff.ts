import type { AuditValues } from './types';

export type DiffKind = 'added' | 'removed' | 'changed' | 'unchanged';
export interface DiffEntry {
  key: string;
  kind: DiffKind;
  before: unknown;
  after: unknown;
}

/** Human-readable rendering of a stored value. */
export function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';
  if (Array.isArray(value)) return value.length ? value.map(formatValue).join(', ') : '(empty)';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** Key-by-key comparison of the old and new state of a resource, in a stable key order. */
export function diffValues(before: AuditValues | null, after: AuditValues | null): DiffEntry[] {
  const b = before ?? {};
  const a = after ?? {};
  const keys = [...new Set([...Object.keys(b), ...Object.keys(a)])];
  return keys.map((key) => {
    const hasBefore = key in b;
    const hasAfter = key in a;
    const kind: DiffKind = !hasBefore ? 'added' : !hasAfter ? 'removed' : formatValue(b[key]) === formatValue(a[key]) ? 'unchanged' : 'changed';
    return { key, kind, before: b[key], after: a[key] };
  });
}
