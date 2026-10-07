import type { Metadata } from 'next';
import { HealthPage } from '@nexus/features/health';

export const metadata: Metadata = { title: 'System Health' };

export default function Page() {
  return <HealthPage />;
}
