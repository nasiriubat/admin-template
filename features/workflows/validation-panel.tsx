'use client';

import { Button, IconRenderer } from '@nexus/ui';
import type { GraphIssue } from './graph';

/** Errors block activation; warnings are advisory. "Show node" selects and centres the offending node. */
export function ValidationPanel({ issues, onFocusNode }: { issues: GraphIssue[]; onFocusNode: (id: string) => void }) {
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  return (
    <section aria-label="Validation" className="space-y-2">
      <p role="status" className="text-sm font-medium text-text">
        {issues.length === 0 ? 'No problems found. This workflow can be activated.' : `${errors.length} ${errors.length === 1 ? 'error' : 'errors'}, ${warnings.length} ${warnings.length === 1 ? 'warning' : 'warnings'}`}
      </p>
      {issues.length > 0 && (
        <ul className="divide-y divide-border rounded-input border border-border bg-surface">
          {[...errors, ...warnings].map((issue) => (
            <li key={issue.id} className="flex items-start gap-2 p-2.5 text-sm">
              <IconRenderer name={issue.severity === 'error' ? 'AlertCircle' : 'AlertTriangle'} className={issue.severity === 'error' ? 'mt-0.5 size-4 shrink-0 text-danger' : 'mt-0.5 size-4 shrink-0 text-warning'} />
              <span className="min-w-0 flex-1 text-text"><span className="sr-only">{issue.severity === 'error' ? 'Error: ' : 'Warning: '}</span>{issue.message}</span>
              {issue.nodeId && <Button size="sm" variant="ghost" onClick={() => onFocusNode(issue.nodeId as string)} aria-label={`Show node for: ${issue.message}`}>Show node</Button>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
