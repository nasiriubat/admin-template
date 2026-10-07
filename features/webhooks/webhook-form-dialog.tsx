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
  toast,
  useZodForm,
} from '@nexus/ui';
import { useCreateWebhook, useUpdateWebhook } from './hooks';
import { webhookFormSchema, type WebhookFormInput } from './schemas';
import { WEBHOOK_EVENTS, type Webhook, type WebhookWithSecret } from './types';
import { toggleItem } from './webhook-utils';

const EMPTY: WebhookFormInput = { url: '', description: '', events: [] };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook?: Webhook | null;
  onCreated: (created: WebhookWithSecret) => void;
}

/** Create or edit an endpoint. Creating hands the one-time signing secret to `onCreated`. */
export function WebhookFormDialog({ open, onOpenChange, webhook, onCreated }: Props) {
  const editing = Boolean(webhook);
  const create = useCreateWebhook();
  const update = useUpdateWebhook();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(webhookFormSchema, { defaultValues: EMPTY });
  const { register, handleSubmit, reset, control, formState } = form;
  const { errors, isSubmitting } = formState;

  useEffect(() => {
    if (open) {
      setFormError(null);
      reset(webhook ? { url: webhook.url, description: webhook.description, events: webhook.events } : EMPTY);
    }
  }, [open, webhook, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (webhook) {
        await update.mutateAsync({ id: webhook.id, input: values });
        toast.success('Endpoint updated', { description: values.url });
        onOpenChange(false);
      } else {
        const created = await create.run(values);
        onOpenChange(false);
        onCreated(created);
      }
    } catch (error) {
      setFormError(applyServerErrors(form as never, error));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit endpoint' : 'Add endpoint'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Change where events are delivered and which ones you receive.' : 'We’ll sign each delivery so you can verify it came from us. The signing secret is shown once.'}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 py-3">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <FormField label="Endpoint URL" required hint="Must be a public https:// address. Localhost and private networks are blocked." error={errors.url?.message}>
              <Input type="url" inputMode="url" autoComplete="off" spellCheck={false} placeholder="https://example.com/webhooks" {...register('url')} />
            </FormField>
            <FormField label="Description" optional error={errors.description?.message}>
              <Input autoComplete="off" {...register('description')} />
            </FormField>
            <Controller
              control={control}
              name="events"
              render={({ field }) => (
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-text">
                    Events <span className="text-danger" aria-hidden="true">*</span>
                  </legend>
                  <ul className="divide-y divide-border rounded-input border border-border">
                    {WEBHOOK_EVENTS.map((ev) => {
                      const id = `event-${ev.value}`;
                      return (
                        <li key={ev.value}>
                          <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 px-3 py-2.5">
                            <Checkbox id={id} className="mt-0.5" checked={field.value.includes(ev.value)} onCheckedChange={(c) => field.onChange(toggleItem(field.value, ev.value, c === true))} />
                            <span className="min-w-0">
                              <span className="block font-mono text-sm text-text">{ev.value}</span>
                              <span className="block text-xs text-text-muted">{ev.description}</span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                  {errors.events?.message && <p role="alert" className="text-xs font-medium text-danger">{errors.events.message}</p>}
                </fieldset>
              )}
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editing ? 'Save changes' : 'Add endpoint'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
