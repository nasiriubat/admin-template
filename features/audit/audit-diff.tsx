import { cn } from '@nexus/ui';
import { diffValues, formatValue, type DiffKind } from './diff';
import type { AuditEvent } from './types';

const marker: Record<DiffKind, { symbol: string; label: string; className: string }> = {
  added: { symbol: '+', label: 'Added', className: 'text-success' },
  removed: { symbol: '−', label: 'Removed', className: 'text-danger' },
  changed: { symbol: '~', label: 'Changed', className: 'text-warning' },
  unchanged: { symbol: '', label: 'Unchanged', className: 'text-text-muted' },
};

/** Expanded row content: before/after as a key/value diff, plus the full request context. */
export function AuditDetails({ event }: { event: AuditEvent }) {
  const entries = diffValues(event.oldValue, event.newValue);
  return (
    <div className="space-y-4">
      {entries.length === 0 ? (
        <p className="text-sm text-text-muted">No data was recorded for this event.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Changes recorded for event {event.id}</caption>
            <thead>
              <tr className="text-xs uppercase tracking-wide text-text-muted">
                <th scope="col" className="py-1 pr-4 font-medium">Field</th>
                <th scope="col" className="py-1 pr-4 font-medium">Before</th>
                <th scope="col" className="py-1 font-medium">After</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const m = marker[e.kind];
                return (
                  <tr key={e.key} className="border-t border-border align-top">
                    <th scope="row" className="whitespace-nowrap py-1.5 pr-4 font-mono text-xs font-medium text-text">
                      <span className={cn('mr-1.5 inline-block w-3 font-bold', m.className)} aria-hidden="true">{m.symbol}</span>
                      {e.key}
                      <span className="sr-only"> ({m.label})</span>
                    </th>
                    <td className={cn('break-words py-1.5 pr-4', e.kind === 'removed' || e.kind === 'changed' ? 'text-danger' : 'text-text-muted')}>{e.kind === 'added' ? '—' : formatValue(e.before)}</td>
                    <td className={cn('break-words py-1.5', e.kind === 'added' || e.kind === 'changed' ? 'text-success' : 'text-text-muted')}>{e.kind === 'removed' ? '—' : formatValue(e.after)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <dl className="grid gap-x-6 gap-y-1 text-xs text-text-muted sm:grid-cols-2">
        <div className="flex gap-2"><dt className="font-medium">IP address</dt><dd className="font-mono">{event.ip}</dd></div>
        <div className="flex gap-2"><dt className="font-medium">Client</dt><dd>{event.userAgent}</dd></div>
      </dl>
    </div>
  );
}
