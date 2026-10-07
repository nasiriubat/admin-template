'use client';

import { useState } from 'react';
import { FormField, Input } from '@nexus/ui';
import { renderTemplate } from './ai-utils';

/** Renders the template with sample values locally. It never calls a model. */
export function PromptTestRun({ template, variables }: { template: string; variables: string[] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const rendered = renderTemplate(template, values);
  return (
    <section aria-labelledby="test-run-heading" className="space-y-3">
      <div>
        <h3 id="test-run-heading" className="text-sm font-semibold text-text">Test run</h3>
        <p className="text-xs text-text-muted">Fill in sample values to preview the final prompt. No request is sent to a model.</p>
      </div>
      {variables.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {variables.map((name) => (
            <FormField key={name} label={name}>
              <Input value={values[name] ?? ''} onChange={(e) => setValues((prev) => ({ ...prev, [name]: e.target.value }))} autoComplete="off" />
            </FormField>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">This template has no variables. Add one with {'{{name}}'}.</p>
      )}
      <pre aria-label="Rendered prompt" data-testid="rendered-prompt" className="max-h-56 overflow-auto whitespace-pre-wrap rounded-input border border-border bg-canvas p-3 font-mono text-xs text-text">
        {rendered || 'Nothing to render yet.'}
      </pre>
    </section>
  );
}
