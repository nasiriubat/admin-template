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
  Select,
  Textarea,
  toast,
  useZodForm,
} from '@nexus/ui';
import { useCreateRole } from './hooks';
import { createRoleSchema, type CreateRoleInput } from './schemas';
import type { Role } from './types';

const EMPTY: CreateRoleInput = { name: '', description: '', copyFrom: '' };

/** Create a custom role, optionally starting from an existing role's permissions. */
export function CreateRoleDialog({ open, onOpenChange, roles, onCreated }: { open: boolean; onOpenChange: (open: boolean) => void; roles: Role[]; onCreated: (role: Role) => void }) {
  const create = useCreateRole();
  const [formError, setFormError] = useState<string | null>(null);
  const schema = useMemo(() => createRoleSchema(roles.map((r) => r.name)), [roles]);
  const form = useZodForm(schema, { defaultValues: EMPTY });
  const { register, handleSubmit, reset, formState } = form;
  const { errors, isSubmitting } = formState;

  useEffect(() => {
    if (open) {
      setFormError(null);
      reset(EMPTY);
    }
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const role = await create.mutateAsync(values);
      toast.success('Role created', { description: role.name });
      onOpenChange(false);
      onCreated(role);
    } catch (error) {
      setFormError(applyServerErrors(form as never, error));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>Create role</DialogTitle>
            <DialogDescription>Custom roles start with no access unless you copy another role.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 py-3">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <FormField label="Role name" required error={errors.name?.message}>
              <Input autoComplete="off" {...register('name')} />
            </FormField>
            <FormField label="Description" error={errors.description?.message}>
              <Textarea rows={2} {...register('description')} />
            </FormField>
            <FormField label="Copy permissions from" hint="Optional.">
              <Select {...register('copyFrom')}>
                <option value="">Start with no permissions</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Create role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
