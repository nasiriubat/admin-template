import type { Metadata } from 'next';
import { WorkflowsPage } from '@nexus/features/workflows';

export const metadata: Metadata = { title: 'Agent Workflows' };

export default function Page() {
  return <WorkflowsPage />;
}
