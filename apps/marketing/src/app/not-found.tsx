import Link from 'next/link';
import { Button, StateMessage } from '@nexus/ui';

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas p-6">
      <StateMessage size="page" icon="Search" title="Page not found" description="That page doesn’t exist." actions={<Button asChild><Link href="/">Back home</Link></Button>} />
    </main>
  );
}
