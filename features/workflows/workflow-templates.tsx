'use client';

import { useEffect, useState } from 'react';
import { Button, IconRenderer, Section } from '@nexus/ui';
import { TEMPLATES } from './templates';
import type { TemplateId } from './types';

const STORAGE_KEY = 'nexus.workflows.templates-dismissed';

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Dismissible gallery of starting points shown above the workflows table. */
export function WorkflowTemplates({ onPick, canManage }: { onPick: (id: TemplateId) => void; canManage: boolean }) {
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => setDismissed(readDismissed()), []);
  if (dismissed) return null;

  return (
    <Section
      title="Start from a template"
      description="Each template creates a ready-to-edit graph."
      actions={
        <Button variant="ghost" size="sm" onClick={() => {
          setDismissed(true);
          try {
            window.localStorage.setItem(STORAGE_KEY, '1');
          } catch {
            /* storage unavailable: dismissal lasts for this visit only */
          }
        }}>
          <IconRenderer name="X" className="size-4" /> Dismiss
        </Button>
      }
    >
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {TEMPLATES.map((t) => (
          <li key={t.id} className="flex flex-col justify-between gap-3 rounded-card border border-border bg-surface p-4">
            <div className="space-y-1">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><IconRenderer name={t.icon} className="size-4" /></span>
              <h3 className="pt-2 text-sm font-semibold text-text">{t.name}</h3>
              <p className="text-sm text-text-muted">{t.description}</p>
            </div>
            <Button variant="secondary" size="sm" disabled={!canManage} onClick={() => onPick(t.id)} aria-label={`Use the ${t.name} template`}>Use template</Button>
          </li>
        ))}
      </ul>
    </Section>
  );
}
