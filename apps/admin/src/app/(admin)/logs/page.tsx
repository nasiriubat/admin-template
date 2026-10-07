import type { Metadata } from 'next';
import { LogsPage } from '@nexus/features/logs';

export const metadata: Metadata = { title: 'Logs' };

export default function Page() {
  return <LogsPage />;
}
