'use client';

import type { ReactNode } from 'react';
import { Button } from '../ui/button';
import { StateMessage, type StateMessageProps } from './empty-state';

export interface ErrorStateProps extends Partial<StateMessageProps> {
  /** The thrown error. Used to pick a friendly message and decide whether retry makes sense. */
  error?: unknown;
  onRetry?: () => void;
  actions?: ReactNode;
}

interface ErrorLike {
  message?: string;
  status?: number;
  code?: string;
  isRetryable?: boolean;
}

function describe(error: unknown): { title: string; description: string; icon: string; retryable: boolean } {
  const e = (error ?? {}) as ErrorLike;
  if (e.code === 'NETWORK_ERROR' || e.code === 'TIMEOUT') {
    return {
      title: 'Connection problem',
      description: e.message ?? 'Check your connection and try again.',
      icon: 'WifiOff',
      retryable: true,
    };
  }
  return {
    title: 'Something went wrong',
    description: e.message ?? 'An unexpected error occurred while loading this content.',
    icon: 'AlertTriangle',
    retryable: e.isRetryable ?? true,
  };
}

export function ErrorState({ error, onRetry, actions, ...rest }: ErrorStateProps) {
  const info = describe(error);
  return (
    <StateMessage
      tone="danger"
      icon={info.icon}
      title={info.title}
      description={info.description}
      actions={
        <>
          {onRetry && info.retryable && (
            <Button variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          )}
          {actions}
        </>
      }
      {...rest}
    />
  );
}
