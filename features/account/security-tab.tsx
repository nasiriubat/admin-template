'use client';

import { useState } from 'react';
import {
  Alert,
  applyServerErrors,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  FormField,
  IconRenderer,
  Input,
  toast,
  useZodForm,
} from '@nexus/ui';
import { useChangePassword, useRevokeOtherSessions } from './hooks';
import { changePasswordSchema } from './schemas';

function PasswordInput({ show, onToggle, label, ...props }: { show: boolean; onToggle: () => void; label: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <Input {...props} type={show ? 'text' : 'password'} className="pr-11" />
      <button
        type="button"
        onClick={onToggle}
        aria-label={`${show ? 'Hide' : 'Show'} ${label}`}
        aria-pressed={show}
        className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-text-muted hover:text-text [@media(pointer:coarse)]:size-11"
      >
        <IconRenderer name={show ? 'EyeOff' : 'Eye'} className="size-4" />
      </button>
    </div>
  );
}

const EMPTY = { current: '', password: '', confirm: '' };

export function SecurityTab() {
  const change = useChangePassword();
  const revokeOthers = useRevokeOtherSessions();
  const [formError, setFormError] = useState<string | null>(null);
  const [shown, setShown] = useState({ current: false, password: false, confirm: false });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const form = useZodForm(changePasswordSchema, { defaultValues: EMPTY });
  const { register, handleSubmit, reset, formState } = form;
  const { errors, isSubmitting } = formState;
  const toggle = (k: keyof typeof shown) => () => setShown((s) => ({ ...s, [k]: !s[k] }));

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await change.mutateAsync(values);
      toast.success('Password updated', { description: 'Other devices stay signed in until you sign them out.' });
      reset(EMPTY);
    } catch (e) {
      setFormError(applyServerErrors(form as never, e));
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Change password</CardTitle>
            <CardDescription>Use at least 10 characters. A long passphrase is stronger than a short complex password.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} noValidate className="max-w-md space-y-4">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <FormField label="Current password" required error={errors.current?.message}>
              {(props) => <PasswordInput {...props} label="current password" show={shown.current} onToggle={toggle('current')} autoComplete="current-password" {...register('current')} />}
            </FormField>
            <FormField label="New password" required error={errors.password?.message}>
              {(props) => <PasswordInput {...props} label="new password" show={shown.password} onToggle={toggle('password')} autoComplete="new-password" {...register('password')} />}
            </FormField>
            <FormField label="Confirm new password" required error={errors.confirm?.message}>
              {(props) => <PasswordInput {...props} label="confirmation" show={shown.confirm} onToggle={toggle('confirm')} autoComplete="new-password" {...register('confirm')} />}
            </FormField>
            <Button type="submit" loading={isSubmitting}>Update password</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Sign out of other sessions</CardTitle>
            <CardDescription>End every session except this one. Use it if you lost a device or signed in on a shared computer.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="danger-ghost" className="border border-danger/30" onClick={() => setConfirmOpen(true)}>
            <IconRenderer name="LogOut" className="size-4" /> Sign out of all other sessions…
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Sign out of all other sessions?"
        description="Every other browser and device will be signed out immediately. This session stays active."
        confirmLabel="Sign out others"
        onConfirm={async () => {
          const { revoked } = await revokeOthers.mutateAsync();
          toast.success(revoked ? `Signed out ${revoked} other session${revoked > 1 ? 's' : ''}` : 'No other sessions were active');
        }}
      />
    </div>
  );
}
