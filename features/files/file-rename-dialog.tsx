'use client';

import { useEffect, useState } from 'react';
import { Alert, applyServerErrors, Button, Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, FormField, Input, toast, useZodForm } from '@nexus/ui';
import { useRenameFile } from './hooks';
import { renameSchema } from './schemas';
import type { FileItem } from './types';

export function FileRenameDialog({ file, onOpenChange }: { file: FileItem | null; onOpenChange: (open: boolean) => void }) {
  const rename = useRenameFile();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(renameSchema, { defaultValues: { name: '' } });
  const { register, handleSubmit, reset, formState } = form;

  useEffect(() => {
    if (file) {
      setFormError(null);
      reset({ name: file.name });
    }
  }, [file, reset]);

  const onSubmit = handleSubmit(async ({ name }) => {
    if (!file) return;
    setFormError(null);
    try {
      await rename.mutateAsync({ id: file.id, name });
      toast.success('File renamed', { description: name });
      onOpenChange(false);
    } catch (error) {
      setFormError(applyServerErrors(form as never, error));
    }
  });

  return (
    <Dialog open={Boolean(file)} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
            <DialogDescription>Links to this file will use the new name.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 py-3">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <FormField label="File name" required error={formState.errors.name?.message}>
              <Input autoComplete="off" {...register('name')} />
            </FormField>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={formState.isSubmitting}>Cancel</Button>
            <Button type="submit" loading={formState.isSubmitting}>Save name</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
