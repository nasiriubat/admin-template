'use client';

import { Toaster as Sonner, toast } from 'sonner';
import { useTheme } from '@nexus/theme';

/** Single toast host. Mount once (AppProviders does). Fire toasts with `toast.success(...)`. */
export function Toaster() {
  const { resolvedMode } = useTheme();
  return (
    <Sonner
      theme={resolvedMode}
      position="bottom-right"
      closeButton
      visibleToasts={4}
      offset={{ bottom: 16, right: 16 }}
      mobileOffset={{ bottom: 88, left: 12, right: 12 }}
      toastOptions={{
        classNames: {
          toast:
            '!bg-surface-elevated !text-text !border !border-border !shadow-popover !rounded-card !font-sans',
          description: '!text-text-muted',
          actionButton: '!bg-primary !text-primary-foreground',
          cancelButton: '!bg-canvas !text-text',
          closeButton: '!bg-surface-elevated !text-text !border-border',
        },
      }}
    />
  );
}

export { toast };
