import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';

const alertVariants = cva('flex gap-3 rounded-card border p-4 text-sm', {
  variants: {
    variant: {
      info: 'border-info/30 bg-info/10 text-text [&_svg]:text-info',
      success: 'border-success/30 bg-success/10 text-text [&_svg]:text-success',
      warning: 'border-warning/30 bg-warning/10 text-text [&_svg]:text-warning',
      danger: 'border-danger/30 bg-danger/10 text-text [&_svg]:text-danger',
    },
  },
  defaultVariants: { variant: 'info' },
});

const icons = { info: 'Info', success: 'CheckCircle2', warning: 'AlertTriangle', danger: 'AlertCircle' } as const;

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>, VariantProps<typeof alertVariants> {
  title?: ReactNode;
}

export function Alert({ className, variant = 'info', title, children, ...props }: AlertProps) {
  const tone = variant ?? 'info';
  return (
    <div role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'} className={cn(alertVariants({ variant }), className)} {...props}>
      <IconRenderer name={icons[tone]} className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 space-y-1">
        {title && <p className="font-semibold leading-tight">{title}</p>}
        {children && <div className="text-text-muted">{children}</div>}
      </div>
    </div>
  );
}
