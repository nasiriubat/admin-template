import type { Metadata } from 'next';
import { WorkflowRunsPage } from '@nexus/features/workflows';

export const metadata: Metadata = { title: 'Workflow Runs' };

export default function Page() {
  return <WorkflowRunsPage />;
}
