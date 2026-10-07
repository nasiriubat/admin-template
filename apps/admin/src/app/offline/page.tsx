import Link from 'next/link';
import { Button, StateMessage } from '@nexus/ui';

export const metadata = { title: 'Offline' };

/** Fallback shown by the service worker when a navigation fails without a connection. */
export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas p-6">
      <StateMessage
        size="page"
        tone="warning"
        icon="WifiOff"
        title="You’re offline"
        description="This page isn’t available without a connection. Reconnect and try again."
        actions={
          <Button asChild>
            <Link href="/">Try again</Link>
          </Button>
        }
      />
    </main>
  );
}
