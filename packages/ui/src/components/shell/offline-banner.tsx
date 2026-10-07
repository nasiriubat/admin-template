'use client';

import { useOnlineStatus } from '../../hooks/use-online-status';
import { IconRenderer } from '../icons/icon-renderer';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-2 border-b border-warning/40 bg-warning px-4 py-2 text-xs font-medium text-warning-foreground">
      <IconRenderer name="WifiOff" className="size-4 shrink-0" />
      <span>
        <strong>You’re offline.</strong> Showing cached content; changes will not be saved until you reconnect.
      </span>
    </div>
  );
}
