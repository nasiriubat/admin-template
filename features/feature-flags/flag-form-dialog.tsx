'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Textarea,
  toast,
  useZodForm,
} from '@nexus/ui';
import { useCreateFlag, useUpdateFlag } from './hooks';
import { clampRollout } from './flag-utils';
import { createFlagSchema, updateFlagSchema } from './schemas';
import type { FeatureFlag } from './types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set the dialog edits this flag (description, owner, rollout); otherwise it creates one. */
  flag?: FeatureFlag | null;
  /** Keys already visible to the user, for instant duplicate feedback. */
  existingKeys?: readonly string[];
}

export function FlagFormDialog({ open, onOpenChange, flag, existingKeys = [] }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {flag ? <EditForm flag={flag} onDone={() => onOpenChange(false)} /> : <CreateForm existingKeys={existingKeys} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function CreateForm({ existingKeys, onDone }: { existingKeys: readonly string[]; onDone: () => void }) {
  const create = useCreateFlag();
  const schema = useMemo(() => createFlagSchema(existingKeys), [existingKeys]);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(schema, { defaultValues: { key: '', description: '', owner: '' } });
  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await create.mutateAsync(values);
      toast.success('Flag created', { description: `${values.key} is off in every environment.` });
      onDone();
    } catch (error) {
      setFormError(applyServerErrors(form as never, error));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <DialogHeader>
        <DialogTitle>Create feature flag</DialogTitle>
        <DialogDescription>New flags start switched off in every environment with a 0% rollout.</DialogDescription>
      </DialogHeader>
      <DialogBody className="space-y-4 py-3">
        {formError && <Alert variant="danger">{formError}</Alert>}
        <FormField label="Key" required hint="Lowercase kebab-case, 3 to 60 characters. Used by SDKs, so it cannot change later." error={errors.key?.message}>
          <Input autoComplete="off" spellCheck={false} className="font-mono" placeholder="new-checkout-flow" {...register('key')} />
        </FormField>
        <FormField label="Description" optional error={errors.description?.message}>
          <Textarea rows={3} {...register('description')} />
        </FormField>
        <FormField label="Owner" required error={errors.owner?.message}>
          <Input autoComplete="off" placeholder="Platform" {...register('owner')} />
        </FormField>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onDone} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Create flag</Button>
      </DialogFooter>
    </form>
  );
}

function EditForm({ flag, onDone }: { flag: FeatureFlag; onDone: () => void }) {
  const update = useUpdateFlag();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(updateFlagSchema, { defaultValues: { description: flag.description, owner: flag.owner, rollout: flag.rollout } });
  const { register, handleSubmit, formState, watch, setValue, reset } = form;
  const { errors, isSubmitting } = formState;
  const rollout = watch('rollout');

  useEffect(() => {
    reset({ description: flag.description, owner: flag.owner, rollout: flag.rollout });
  }, [flag, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await update.mutateAsync({ id: flag.id, input: values });
      toast.success('Flag updated', { description: `${flag.key} rollout is ${values.rollout}%.` });
      onDone();
    } catch (error) {
      setFormError(applyServerErrors(form as never, error));
    }
  });

  const rolloutValue = typeof rollout === 'number' && Number.isFinite(rollout) ? rollout : 0;

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <DialogHeader>
        <DialogTitle>Edit {flag.key}</DialogTitle>
        <DialogDescription>Rollout applies to every environment where this flag is switched on.</DialogDescription>
      </DialogHeader>
      <DialogBody className="space-y-4 py-3">
        {formError && <Alert variant="danger">{formError}</Alert>}
        <FormField label="Rollout percentage" required error={errors.rollout?.message}>
          {(props) => (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                aria-label="Rollout percentage slider"
                value={rolloutValue}
                onChange={(e) => setValue('rollout', clampRollout(Number(e.target.value)), { shouldDirty: true, shouldValidate: true })}
                className="h-11 min-w-0 flex-1 accent-primary"
              />
              <div className="flex items-center gap-1">
                <Input
                  {...props}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  className="w-20 text-right"
                  {...register('rollout', { valueAsNumber: true })}
                />
                <span aria-hidden="true" className="text-sm text-text-muted">%</span>
              </div>
            </div>
          )}
        </FormField>
        <FormField label="Description" optional error={errors.description?.message}>
          <Textarea rows={3} {...register('description')} />
        </FormField>
        <FormField label="Owner" required error={errors.owner?.message}>
          <Input autoComplete="off" {...register('owner')} />
        </FormField>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onDone} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save changes</Button>
      </DialogFooter>
    </form>
  );
}
