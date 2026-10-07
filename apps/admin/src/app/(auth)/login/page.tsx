import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@nexus/features/account';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <>
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-text-muted">Sign in to continue to your workspace.</p>
      </header>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
