import type { Metadata } from 'next';
import { JobsPage } from '@nexus/features/jobs';

export const metadata: Metadata = { title: 'Jobs & Queues' };

export default function Page() {
  return <JobsPage />;
}
