import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@nexus/features/account';

export const metadata: Metadata = { title: 'Forgot password' };

export default function ForgotPasswordPage() {
  return (
    <>
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
        <p className="text-sm text-text-muted">Enter your email and we’ll send you a reset link.</p>
      </header>
      <ForgotPasswordForm />
    </>
  );
}
