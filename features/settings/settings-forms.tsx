'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Controller, type FieldValues, type UseFormReturn } from 'react-hook-form';
import {
  Alert,
  applyServerErrors,
  Button,
  Card,
  CardContent,
  FormField,
  FormSection,
  Input,
  Select,
  StickyActionBar,
  Switch,
  toast,
  useUnsavedChangesWarning,
  useZodForm,
} from '@nexus/ui';
import { useSaveSettings } from './hooks';
import { generalSchema, notificationsSchema, securitySchema, type GeneralInput, type NotificationsInput, type SecurityInput } from './schemas';
import { DomainTagInput } from './tag-input';
import { LANGUAGES, NOTIFICATION_EVENTS, TIMEZONES, type GeneralSettings, type NotificationSettings, type SecuritySettings } from './types';

interface ShellProps<T extends FieldValues> {
  form: UseFormReturn<T, unknown, never>;
  readOnly: boolean;
  formError: string | null;
  saving: boolean;
  onSubmit: () => void;
  onDirtyChange: (dirty: boolean) => void;
  children: ReactNode;
}

/** Shared frame: one Card, disabled fieldset when read-only, sticky save bar and unsaved-changes guard. */
function FormShell<T extends FieldValues>({ form, readOnly, formError, saving, onSubmit, onDirtyChange, children }: ShellProps<T>) {
  const dirty = form.formState.isDirty;
  useUnsavedChangesWarning(dirty);
  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);

  return (
    <form onSubmit={onSubmit} noValidate>
      <Card>
        <CardContent>
          <fieldset disabled={readOnly} className="min-w-0 space-y-6">
            {formError && <Alert variant="danger">{formError}</Alert>}
            {children}
          </fieldset>
        </CardContent>
      </Card>
      {!readOnly && (
        <StickyActionBar dirty={dirty}>
          <Button variant="secondary" onClick={() => form.reset()} disabled={!dirty || saving}>
            Discard
          </Button>
          <Button type="submit" loading={saving} disabled={!dirty}>
            Save changes
          </Button>
        </StickyActionBar>
      )}
    </form>
  );
}

export interface CategoryFormProps<T> {
  data: T;
  readOnly: boolean;
  onDirtyChange: (dirty: boolean) => void;
}

export function GeneralForm({ data, readOnly, onDirtyChange }: CategoryFormProps<GeneralSettings>) {
  const save = useSaveSettings('general');
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(generalSchema, { defaultValues: data as GeneralInput });
  const { register, handleSubmit, reset, formState } = form;
  const { errors } = formState;
  useEffect(() => reset(data as GeneralInput), [data, reset]);

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      reset((await save.mutateAsync(values)) as GeneralInput);
      toast.success('General settings saved');
    } catch (e) {
      setFormError(applyServerErrors(form as never, e));
    }
  });

  return (
    <FormShell form={form as never} readOnly={readOnly} formError={formError} saving={save.isPending} onSubmit={submit} onDirtyChange={onDirtyChange}>
      <FormSection title="Workspace" description="How your workspace appears to teammates and in emails.">
        <FormField label="Workspace name" required error={errors.workspaceName?.message}>
          <Input autoComplete="organization" {...register('workspaceName')} />
        </FormField>
        <FormField label="Support email" required hint="Shown to users who need help." error={errors.supportEmail?.message}>
          <Input type="email" inputMode="email" autoComplete="off" {...register('supportEmail')} />
        </FormField>
      </FormSection>
      <FormSection title="Regional" description="Defaults for dates, times and interface language.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Timezone" error={errors.timezone?.message}>
            <Select {...register('timezone')}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
            </Select>
          </FormField>
          <FormField label="Default language" error={errors.language?.message}>
            <Select {...register('language')}>
              {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </Select>
          </FormField>
        </div>
      </FormSection>
    </FormShell>
  );
}

export function SecurityForm({ data, readOnly, onDirtyChange }: CategoryFormProps<SecuritySettings>) {
  const save = useSaveSettings('security');
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(securitySchema, { defaultValues: data as SecurityInput });
  const { register, control, handleSubmit, reset, formState } = form;
  const { errors } = formState;
  useEffect(() => reset(data as SecurityInput), [data, reset]);

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      reset((await save.mutateAsync(values)) as SecurityInput);
      toast.success('Security settings saved');
    } catch (e) {
      setFormError(applyServerErrors(form as never, e));
    }
  });

  return (
    <FormShell form={form as never} readOnly={readOnly} formError={formError} saving={save.isPending} onSubmit={submit} onDirtyChange={onDirtyChange}>
      <FormSection title="Authentication" description="Rules applied to everyone who signs in.">
        <Controller
          control={control}
          name="requireMfa"
          render={({ field }) => (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p id="mfa-label" className="text-sm font-medium text-text">Require multi-factor authentication</p>
                <p id="mfa-hint" className="text-sm text-text-muted">Members must set up a second factor at their next sign-in.</p>
              </div>
              <Switch aria-labelledby="mfa-label" aria-describedby="mfa-hint" checked={Boolean(field.value)} onCheckedChange={field.onChange} />
            </div>
          )}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Session timeout (minutes)" required hint="Idle sessions end after this long." error={errors.sessionTimeoutMinutes?.message}>
            <Input type="number" inputMode="numeric" min={5} {...register('sessionTimeoutMinutes', { valueAsNumber: true })} />
          </FormField>
          <FormField label="Minimum password length" required hint="Between 8 and 64 characters." error={errors.passwordMinLength?.message}>
            <Input type="number" inputMode="numeric" min={8} max={64} {...register('passwordMinLength', { valueAsNumber: true })} />
          </FormField>
        </div>
      </FormSection>
      <FormSection title="Allowed email domains" description="Only addresses on these domains can be invited. Leave empty to allow any domain.">
        <Controller
          control={control}
          name="allowedDomains"
          render={({ field }) => (
            <FormField label="Domains" optional hint="Press Enter or comma after each domain." error={errors.allowedDomains?.message}>
              {(props) => <DomainTagInput {...props} disabled={readOnly} value={field.value ?? []} onChange={field.onChange} />}
            </FormField>
          )}
        />
      </FormSection>
    </FormShell>
  );
}

export function NotificationsForm({ data, readOnly, onDirtyChange }: CategoryFormProps<NotificationSettings>) {
  const save = useSaveSettings('notifications');
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(notificationsSchema, { defaultValues: data as NotificationsInput });
  const { control, handleSubmit, reset } = form;
  useEffect(() => reset(data as NotificationsInput), [data, reset]);

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      reset((await save.mutateAsync(values)) as NotificationsInput);
      toast.success('Notification preferences saved');
    } catch (e) {
      setFormError(applyServerErrors(form as never, e));
    }
  });

  return (
    <FormShell form={form as never} readOnly={readOnly} formError={formError} saving={save.isPending} onSubmit={submit} onDirtyChange={onDirtyChange}>
      <div>
        <div className="hidden grid-cols-[minmax(0,1fr)_5rem_5rem] gap-4 border-b border-border pb-2 text-xs font-medium uppercase tracking-wide text-text-muted sm:grid" aria-hidden="true">
          <span>Event</span>
          <span className="text-center">Email</span>
          <span className="text-center">In-app</span>
        </div>
        <ul className="divide-y divide-border">
          {NOTIFICATION_EVENTS.map((event) => (
            <li key={event.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_5rem_5rem] sm:items-center sm:gap-4">
              <div>
                <p className="text-sm font-medium text-text">{event.label}</p>
                <p className="text-sm text-text-muted">{event.description}</p>
              </div>
              {(['email', 'inApp'] as const).map((channel) => (
                <Controller
                  key={channel}
                  control={control}
                  name={`events.${event.id}.${channel}`}
                  render={({ field }) => (
                    <label className="flex items-center justify-between gap-3 sm:justify-center">
                      <span className="text-sm text-text-muted sm:sr-only">{channel === 'email' ? 'Email' : 'In-app'}</span>
                      <Switch
                        aria-label={`${event.label}: ${channel === 'email' ? 'email' : 'in-app'} notifications`}
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                      />
                    </label>
                  )}
                />
              ))}
            </li>
          ))}
        </ul>
      </div>
    </FormShell>
  );
}
