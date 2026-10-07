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
import { maskKey } from './ai-utils';
import { useCreateProvider, useUpdateProvider } from './hooks';
import { providerFormSchema, type ProviderFormInput } from './schemas';
import { PROVIDER_TYPES, type Provider } from './types';

const EMPTY: ProviderFormInput = { name: '', type: 'openai-compatible', baseUrl: 'https://', apiKey: '' };

/**
 * Add or edit a provider. The API key is write-only: after saving, only a masked value is ever
 * shown, and changing it means entering a replacement through "Replace key".
 */
export function ProviderFormDialog({
  open,
  onOpenChange,
  provider,
  replaceKey = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider?: Provider | null;
  /** Open an existing provider straight into the replace-key state. */
  replaceKey?: boolean;
}) {
  const editing = Boolean(provider);
  const create = useCreateProvider();
  const update = useUpdateProvider();
  const [formError, setFormError] = useState<string | null>(null);
  const [replacing, setReplacing] = useState(false);
  const form = useZodForm(providerFormSchema(editing ? 'edit' : 'create'), { defaultValues: EMPTY });
  const { register, handleSubmit, reset, formState } = form;
  const { errors, isSubmitting } = formState;
  const showKeyInput = !editing || replacing || !provider?.keyLast4;

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    setReplacing(replaceKey);
    reset(provider ? { name: provider.name, type: provider.type, baseUrl: provider.baseUrl, apiKey: '' } : EMPTY);
  }, [open, provider, replaceKey, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (provider) await update.mutateAsync({ id: provider.id, input: values });
      else await create.mutateAsync(values);
      toast.success(editing ? 'Provider updated' : 'Provider added', { description: values.name });
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
            <DialogTitle>{editing ? 'Edit provider' : 'Add provider'}</DialogTitle>
            <DialogDescription>Connect a model provider. Keys are stored securely and can’t be viewed again after saving.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 py-3">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <FormField label="Name" required error={errors.name?.message}>
              <Input autoComplete="off" {...register('name')} />
            </FormField>
            <FormField label="Type" required error={errors.type?.message}>
              <Select {...register('type')}>
                {PROVIDER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </FormField>
            <FormField label="Base URL" required error={errors.baseUrl?.message} hint="Must start with https://">
              <Input type="url" inputMode="url" autoComplete="off" {...register('baseUrl')} />
            </FormField>
            {showKeyInput ? (
              <FormField label={editing ? 'New API key' : 'API key'} required={!editing} optional={editing} error={errors.apiKey?.message} hint="Write-only. It is never displayed after saving.">
                <Input type="password" autoComplete="new-password" spellCheck={false} {...register('apiKey')} />
              </FormField>
            ) : (
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-text">API key</p>
                <div className="flex items-center justify-between gap-3 rounded-input border border-border bg-canvas px-3 py-2">
                  <code className="truncate text-sm text-text-muted" data-testid="masked-key">{maskKey(provider?.keyPrefix ?? null, provider?.keyLast4 ?? null)}</code>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setReplacing(true)}>Replace key</Button>
                </div>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editing ? 'Save changes' : 'Add provider'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
