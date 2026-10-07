'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  applyServerErrors,
  Badge,
  Button,
  ConfirmDialog,
  formatRelative,
  FormField,
  Input,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Textarea,
  toast,
  useZodForm,
} from '@nexus/ui';
import { extractVariables } from './ai-utils';
import { useCreatePrompt, useRestorePrompt, useUpdatePrompt } from './hooks';
import { PromptTestRun } from './prompt-test-run';
import { promptFormSchema, type PromptFormInput } from './schemas';
import type { Prompt, PromptVersion } from './types';

const EMPTY: PromptFormInput = { name: '', description: '', tags: '', template: '', note: '' };

/** Create or edit a prompt template: editor, detected variables, test run and version history. */
export function PromptEditorSheet({ open, onOpenChange, prompt, canManage }: { open: boolean; onOpenChange: (open: boolean) => void; prompt: Prompt | null; canManage: boolean }) {
  const create = useCreatePrompt();
  const update = useUpdatePrompt();
  const restore = useRestorePrompt();
  const [formError, setFormError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<PromptVersion | null>(null);
  const form = useZodForm(promptFormSchema, { defaultValues: EMPTY });
  const { register, handleSubmit, reset, watch, formState } = form;
  const { errors, isSubmitting } = formState;
  const template = watch('template') ?? '';
  const variables = extractVariables(template);

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    reset(prompt ? { name: prompt.name, description: prompt.description, tags: prompt.tags.join(', '), template: prompt.template, note: '' } : EMPTY);
  }, [open, prompt?.id, prompt?.currentVersion, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (prompt) await update.mutateAsync({ id: prompt.id, input: values });
      else await create.mutateAsync(values);
      toast.success(prompt ? 'Prompt saved' : 'Prompt created', { description: values.name });
      onOpenChange(false);
    } catch (error) {
      setFormError(applyServerErrors(form as never, error));
    }
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <SheetHeader>
            <SheetTitle>{prompt ? prompt.name : 'New prompt'}</SheetTitle>
            <SheetDescription>{prompt ? `Version ${prompt.currentVersion}. Saving a changed template creates a new version.` : 'Write a template and use {{variable}} placeholders for dynamic values.'}</SheetDescription>
          </SheetHeader>
          <SheetBody className="space-y-6 py-3">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <div className="space-y-4">
              <FormField label="Name" required error={errors.name?.message}>
                <Input autoComplete="off" readOnly={!canManage} {...register('name')} />
              </FormField>
              <FormField label="Description" optional error={errors.description?.message}>
                <Input autoComplete="off" readOnly={!canManage} {...register('description')} />
              </FormField>
              <FormField label="Tags" optional hint="Separate with commas." error={errors.tags?.message}>
                <Input autoComplete="off" readOnly={!canManage} {...register('tags')} />
              </FormField>
              <FormField label="Template" required error={errors.template?.message}>
                <Textarea rows={8} spellCheck={false} className="font-mono text-xs" readOnly={!canManage} {...register('template')} />
              </FormField>
              <div className="flex flex-wrap items-center gap-2" aria-label="Detected variables" role="group">
                <span className="text-xs text-text-muted">Variables:</span>
                {variables.length ? variables.map((v) => <Badge key={v} variant="primary" className="font-mono">{`{{${v}}}`}</Badge>) : <span className="text-xs text-text-muted">none detected</span>}
              </div>
              {canManage && prompt && (
                <FormField label="Change note" optional error={errors.note?.message}>
                  <Input autoComplete="off" placeholder="What changed in this version?" {...register('note')} />
                </FormField>
              )}
            </div>

            <PromptTestRun template={template} variables={variables} />

            {prompt && (
              <section aria-labelledby="history-heading" className="space-y-2">
                <h3 id="history-heading" className="text-sm font-semibold text-text">Version history</h3>
                <ul className="divide-y divide-border rounded-input border border-border">
                  {[...prompt.versions].reverse().map((v) => (
                    <li key={v.version} className="flex items-center justify-between gap-3 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text">
                          Version {v.version} {v.version === prompt.currentVersion && <Badge variant="success" className="ml-1">Current</Badge>}
                        </p>
                        <p className="truncate text-xs text-text-muted">{v.note} · {v.author} · {formatRelative(v.createdAt)}</p>
                      </div>
                      {canManage && v.version !== prompt.currentVersion && (
                        <Button type="button" size="sm" variant="secondary" onClick={() => setRestoring(v)} aria-label={`Restore version ${v.version}`}>Restore</Button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </SheetBody>
          <SheetFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>{canManage ? 'Cancel' : 'Close'}</Button>
            {canManage && <Button type="submit" loading={isSubmitting}>{prompt ? 'Save changes' : 'Create prompt'}</Button>}
          </SheetFooter>
        </form>
        <ConfirmDialog
          open={Boolean(restoring)}
          onOpenChange={(o) => !o && setRestoring(null)}
          title={`Restore version ${restoring?.version}?`}
          description="The current template is replaced with this version. The replaced text stays in the history as its own version, so nothing is lost."
          confirmLabel="Restore version"
          tone="primary"
          onConfirm={async () => {
            if (!prompt || !restoring) return;
            await restore.mutateAsync({ id: prompt.id, version: restoring.version });
            toast.success(`Version ${restoring.version} restored`, { description: prompt.name });
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
