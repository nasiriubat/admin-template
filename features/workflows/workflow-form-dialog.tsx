'use client';

import { useEffect, useState } from 'react';
import { Alert, applyServerErrors, Button, cn, Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, FormField, IconRenderer, Input, Textarea, toast, useZodForm } from '@nexus/ui';
import { useRouter } from 'next/navigation';
import { useCreateWorkflow } from './hooks';
import { workflowFormSchema } from './schemas';
import { TEMPLATES } from './templates';
import type { TemplateId } from './types';

/** "New workflow" dialog: name, description and a starting template. Opens the builder on success. */
export function WorkflowFormDialog({ open, onOpenChange, template = 'blank' }: { open: boolean; onOpenChange: (open: boolean) => void; template?: TemplateId }) {
  const router = useRouter();
  const create = useCreateWorkflow();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(workflowFormSchema, { defaultValues: { name: '', description: '', template } });
  const { register, handleSubmit, reset, setValue, watch, formState } = form;
  const { errors, isSubmitting } = formState;
  const selected = watch('template');

  useEffect(() => {
    if (open) {
      setFormError(null);
      reset({ name: '', description: '', template });
    }
  }, [open, template, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const created = await create.mutateAsync(values);
      toast.success('Workflow created', { description: created.name });
      onOpenChange(false);
      router.push(`/workflows/${created.id}`);
    } catch (error) {
      setFormError(applyServerErrors(form as never, error));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>New workflow</DialogTitle>
            <DialogDescription>Name it, pick a starting point and open the builder. You can change everything later.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 py-3">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <FormField label="Name" required error={errors.name?.message}>
              <Input autoComplete="off" placeholder="e.g. Customer onboarding assistant" {...register('name')} />
            </FormField>
            <FormField label="Description" optional error={errors.description?.message}>
              <Textarea rows={2} {...register('description')} />
            </FormField>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-text">Template</legend>
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Template">
                {TEMPLATES.map((t) => (
                  <label key={t.id} className={cn('flex cursor-pointer gap-3 rounded-card border p-3 text-sm [@media(pointer:coarse)]:min-h-11', selected === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-border-strong', 'focus-within:outline focus-within:outline-2 focus-within:outline-primary')}>
                    <input type="radio" className="sr-only" name="template" value={t.id} checked={selected === t.id} onChange={() => setValue('template', t.id, { shouldDirty: true })} />
                    <IconRenderer name={t.icon} className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      <span className="block font-medium text-text">{t.name}</span>
                      <span className="block text-xs text-text-muted">{t.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Create workflow</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
