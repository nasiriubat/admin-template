'use client';

import { useEffect } from 'react';
import { Button, ErrorState } from '@nexus/ui';

/** Error boundary for any page inside the admin shell. The shell itself keeps working. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <ErrorState
      size="page"
      error={{ message: 'This page ran into an unexpected problem. Your data is safe.', isRetryable: true }}
      onRetry={reset}
      actions={
        <Button variant="ghost" onClick={() => (window.location.href = '/')}>
          Go to dashboard
        </Button>
      }
    />
  );
}
