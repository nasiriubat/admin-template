'use client';

import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  Alert,
  applyServerErrors,
  Button,
  Checkbox,
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
  useZodForm,
} from '@nexus/ui';
import { useCreateApiKey } from './hooks';
import { toggleScope } from './key-utils';
import { createApiKeySchema, type CreateApiKeyInput } from './schemas';
import { API_KEY_SCOPES, EXPIRY_PRESETS, type CreatedApiKey } from './types';

const EMPTY: CreateApiKeyInput = { name: '', scopes: [], expiry: '90' };

export function ApiKeyCreateDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (open: boolean) => void; onCreated: (created: CreatedApiKey) => void }) {
  const { create } = useCreateApiKey();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(createApiKeySchema, { defaultValues: EMPTY });
  const { register, handleSubmit, reset, control, formState } = form;
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
      const created = await create(values);
      onOpenChange(false);
      onCreated(created);
    } catch (error) {
      setFormError(applyServerErrors(form as never, error));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>Grant only the scopes this integration needs. You can revoke the key at any time.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 py-3">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <FormField label="Name" required hint="Helps you recognise the key later, for example the service that uses it." error={errors.name?.message}>
              <Input autoComplete="off" {...register('name')} />
            </FormField>
            <Controller
              control={control}
              name="scopes"
              render={({ field }) => (
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-text">
                    Scopes <span className="text-danger" aria-hidden="true">*</span>
                  </legend>
                  <ul className="divide-y divide-border rounded-input border border-border">
                    {API_KEY_SCOPES.map((scope) => {
                      const id = `scope-${scope.value}`;
                      return (
                        <li key={scope.value}>
                          <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 px-3 py-2.5">
                            <Checkbox
                              id={id}
                              className="mt-0.5"
                              checked={field.value.includes(scope.value)}
                              onCheckedChange={(checked) => field.onChange(toggleScope(field.value, scope.value, checked === true))}
                            />
                            <span className="min-w-0">
                              <span className="block font-mono text-sm text-text">{scope.value}</span>
                              <span className="block text-xs text-text-muted">{scope.description}</span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                  {errors.scopes?.message && <p role="alert" className="text-xs font-medium text-danger">{errors.scopes.message}</p>}
                </fieldset>
              )}
            />
            <FormField label="Expiry" required error={errors.expiry?.message}>
              <Select {...register('expiry')}>
                {EXPIRY_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
            </FormField>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Create key</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
