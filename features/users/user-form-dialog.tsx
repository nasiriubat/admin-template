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
import { ROLE_OPTIONS } from '../_shared/roles';
import { useCreateUser, useUpdateUser } from './hooks';
import { userFormSchema, type UserFormInput } from './schemas';
import { USER_STATUSES, type User } from './types';

const EMPTY: UserFormInput = { name: '', email: '', role: 'viewer', status: 'invited' };

/** Create (invite) or edit a user. Server validation errors map back onto the fields. */
export function UserFormDialog({ open, onOpenChange, user }: { open: boolean; onOpenChange: (open: boolean) => void; user?: User | null }) {
  const editing = Boolean(user);
  const create = useCreateUser();
  const update = useUpdateUser();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(userFormSchema, { defaultValues: EMPTY });
  const { register, handleSubmit, reset, formState } = form;
  const { errors, isSubmitting } = formState;

  useEffect(() => {
    if (open) {
      setFormError(null);
      reset(user ? { name: user.name, email: user.email, role: user.role, status: user.status } : EMPTY);
    }
  }, [open, user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (user) await update.mutateAsync({ id: user.id, input: values });
      else await create.mutateAsync(values);
      toast.success(editing ? 'User updated' : 'Invitation sent', { description: values.email });
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
            <DialogTitle>{editing ? 'Edit user' : 'Invite user'}</DialogTitle>
            <DialogDescription>{editing ? 'Update this person’s details and access.' : 'They’ll get an email with a link to set up their account.'}</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 py-3">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <FormField label="Full name" required error={errors.name?.message}>
              <Input autoComplete="off" {...register('name')} />
            </FormField>
            <FormField label="Email" required error={errors.email?.message}>
              <Input type="email" autoComplete="off" inputMode="email" {...register('email')} />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Role" required error={errors.role?.message}>
                <Select {...register('role')}>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Status" error={errors.status?.message}>
                <Select {...register('status')}>
                  {USER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editing ? 'Save changes' : 'Send invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
