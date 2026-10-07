import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordForm } from '@nexus/features/account';

export const metadata: Metadata = { title: 'Choose a new password' };

export default function ResetPasswordPage() {
  return (
    <>
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
        <p className="text-sm text-text-muted">Pick something long and unique.</p>
      </header>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
