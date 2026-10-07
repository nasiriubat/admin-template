import type { Metadata } from 'next';
import { WorkflowBuilderPage } from '@nexus/features/workflows';

export const metadata: Metadata = { title: 'Workflow Builder' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkflowBuilderPage id={id} />;
}
