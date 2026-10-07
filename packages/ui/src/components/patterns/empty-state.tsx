import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';

export interface StateMessageProps {
  icon?: string;
  title: string;
  description?: ReactNode;
  /** Primary and secondary actions (buttons or links). */
  actions?: ReactNode;
  className?: string;
  /** Visual weight: `page` fills a content area, `inline` sits inside a card or table. */
  size?: 'page' | 'inline';
  tone?: 'neutral' | 'danger' | 'warning';
}

const tones = {
  neutral: 'bg-primary/10 text-primary',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
} as const;

/** Shared layout behind EmptyState, ErrorState and UnauthorizedState. */
export function StateMessage({ icon = 'Inbox', title, description, actions, className, size = 'inline', tone = 'neutral' }: StateMessageProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', size === 'page' ? 'min-h-[50dvh] px-4 py-12' : 'px-4 py-10', className)}>
      <div className={cn('mb-4 grid size-12 place-items-center rounded-2xl', tones[tone])}>
        <IconRenderer name={icon} className="size-6" />
      </div>
      <h3 className="text-base font-semibold text-text">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm text-text-muted">{description}</p>}
      {actions && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState(props: StateMessageProps) {
  return <StateMessage {...props} />;
}
