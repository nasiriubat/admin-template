'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  applyServerErrors,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Select,
  toast,
  useZodForm,
} from '@nexus/ui';
import { useCreateSource } from './hooks';
import { sourceFormSchema, type SourceFormInput } from './schemas';
import { SCHEDULES, SOURCE_TYPES, sourceTypeMeta } from './types';

const EMPTY: SourceFormInput = { type: 'web', name: '', location: '', schedule: 'daily', credential: '' };

/** Add a connector. The credential field is write-only: masked, never prefilled, never shown again. */
export function SourceFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const create = useCreateSource();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(sourceFormSchema, { defaultValues: EMPTY });
  const { register, handleSubmit, reset, watch, formState } = form;
  const { errors, isSubmitting } = formState;
  const meta = sourceTypeMeta(watch('type'));

  useEffect(() => {
    if (open) {
      setFormError(null);
      reset(EMPTY);
    }
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await create.mutateAsync({ ...values, credential: values.credential?.trim() || undefined });
      toast.success('Source added', { description: values.name });
      onOpenChange(false);
    } catch (error) {
      setFormError(applyServerErrors(form as never, error));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>Add source</DialogTitle>
            <DialogDescription>Connect a location to keep your knowledge base in sync.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 py-3">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Type" required error={errors.type?.message}>
                <Select {...register('type')}>
                  {SOURCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </FormField>
              <FormField label="Sync schedule" error={errors.schedule?.message}>
                <Select {...register('schedule')}>
                  {SCHEDULES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </FormField>
            </div>
            <FormField label="Name" required error={errors.name?.message}>
              <Input autoComplete="off" {...register('name')} />
            </FormField>
            <FormField label={meta.locationLabel} required error={errors.location?.message}>
              <Input autoComplete="off" placeholder={meta.placeholder} {...register('location')} />
            </FormField>
            <FormField
              label="Access credential"
              optional={meta.value !== 's3'}
              required={meta.value === 's3'}
              error={errors.credential?.message}
              hint="Stored securely and never shown again. Leave blank for public sources."
            >
              <Input type="password" autoComplete="new-password" spellCheck={false} {...register('credential')} />
            </FormField>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Add source</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
