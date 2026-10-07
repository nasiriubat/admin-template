'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AuthError, safeRedirectPath, useAuth } from '@nexus/auth';
import { Alert, Button, Checkbox, FormField, IconRenderer, Input, useZodForm } from '@nexus/ui';
import { getRuntimeConfig } from '@nexus/config';
import { isDemoMode } from '../_shared/api';
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from './schemas';

export function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const next = safeRedirectPath(useSearchParams().get('next'));
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState, watch, setValue } = useZodForm(loginSchema, { defaultValues: { email: '', password: '', remember: false } });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await signIn(values);
      router.replace(next);
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Something went wrong. Please try again.');
    }
  });

  const notConfigured = !isDemoMode && !getRuntimeConfig().apiBaseUrl;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {notConfigured && (
        <Alert variant="warning" title="No backend configured">
          Set <code>NEXT_PUBLIC_API_BASE_URL</code> at build time to your API, or <code>NEXT_PUBLIC_DEMO_MODE=true</code> for a demo build (never in production).
        </Alert>
      )}
      {isDemoMode && (
        <Alert variant="info" title="Demo mode">
          Sign in with <strong>admin@example.com</strong> (full access), <strong>editor@example.com</strong> or <strong>viewer@example.com</strong> and any password of 8+ characters.
        </Alert>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      <FormField label="Email" required error={formState.errors.email?.message}>
        <Input type="email" autoComplete="username" inputMode="email" autoFocus {...register('email')} />
      </FormField>
      <FormField label="Password" required error={formState.errors.password?.message}>
        {(props) => (
          <div className="relative">
            <Input {...props} type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="pr-11" {...register('password')} />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-text-muted hover:text-text"
            >
              <IconRenderer name={showPassword ? 'EyeOff' : 'Eye'} className="size-4" />
            </button>
          </div>
        )}
      </FormField>
      <div className="flex items-center justify-between text-sm">
        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-text">
          <Checkbox checked={Boolean(watch('remember'))} onCheckedChange={(v) => setValue('remember', v === true)} /> Keep me signed in
        </label>
        <Link href="/forgot-password" className="font-medium text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" size="lg" className="w-full" loading={formState.isSubmitting}>
        Sign in
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const { requestPasswordReset } = useAuth();
  const [sent, setSent] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useZodForm(forgotPasswordSchema, { defaultValues: { email: '' } });

  if (sent) {
    return (
      <div className="space-y-4">
        <Alert variant="success" title="Check your inbox">
          If an account exists for <strong>{sent}</strong>, we’ve sent a link to reset the password. It expires in 30 minutes.
        </Alert>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async ({ email }) => {
        await requestPasswordReset(email).catch(() => undefined);
        setSent(email);
      })}
      noValidate
      className="space-y-4"
    >
      <FormField label="Email" required error={formState.errors.email?.message}>
        <Input type="email" autoComplete="email" inputMode="email" autoFocus {...register('email')} />
      </FormField>
      <Button type="submit" size="lg" className="w-full" loading={formState.isSubmitting}>
        Send reset link
      </Button>
      <p className="text-center text-sm">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const token = useSearchParams().get('token');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useZodForm(resetPasswordSchema, { defaultValues: { password: '', confirm: '' } });

  if (!token) {
    return (
      <Alert variant="warning" title="This link is invalid or has expired">
        Request a new password reset link to continue.
      </Alert>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async () => {
        setError(null);
        try {
          // Wire to POST /auth/reset-password { token, password } on your backend.
          await new Promise((resolve) => setTimeout(resolve, 400));
          router.replace('/login');
        } catch {
          setError('We couldn’t reset your password. The link may have expired.');
        }
      })}
      noValidate
      className="space-y-4"
    >
      {error && <Alert variant="danger">{error}</Alert>}
      <FormField label="New password" required hint="At least 10 characters." error={formState.errors.password?.message}>
        <Input type="password" autoComplete="new-password" autoFocus {...register('password')} />
      </FormField>
      <FormField label="Confirm password" required error={formState.errors.confirm?.message}>
        <Input type="password" autoComplete="new-password" {...register('confirm')} />
      </FormField>
      <Button type="submit" size="lg" className="w-full" loading={formState.isSubmitting}>
        Set new password
      </Button>
    </form>
  );
}
