import type { ReactNode } from 'react';
import { StateMessage, type StateMessageProps } from './empty-state';

export interface UnauthorizedStateProps extends Partial<StateMessageProps> {
  /** `signed-out` = needs to sign in; `forbidden` = signed in without permission. */
  reason?: 'signed-out' | 'forbidden';
  actions?: ReactNode;
}

export function UnauthorizedState({ reason = 'forbidden', actions, ...rest }: UnauthorizedStateProps) {
  const forbidden = reason === 'forbidden';
  return (
    <StateMessage
      tone="warning"
      icon={forbidden ? 'ShieldAlert' : 'Lock'}
      title={forbidden ? 'You don’t have access to this page' : 'Please sign in to continue'}
      description={
        forbidden
          ? 'Your account does not have the permission required to view this. Ask an administrator to grant access.'
          : 'Your session has ended or has not started yet.'
      }
      actions={actions}
      {...rest}
    />
  );
}
