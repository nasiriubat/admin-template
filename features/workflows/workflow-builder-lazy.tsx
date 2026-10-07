'use client';

import dynamic from 'next/dynamic';
import { PageContainer, Skeleton } from '@nexus/ui';

/**
 * The builder pulls in React Flow (~170 kB), so it loads on demand: the workflows list and runs
 * pages, and every other module, never pay for it. It is client-only (the canvas needs the DOM).
 */
export const WorkflowBuilderPage = dynamic(() => import('./workflow-builder-page').then((m) => m.WorkflowBuilderPage), {
  ssr: false,
  loading: () => (
    <PageContainer>
      <div role="status" aria-label="Loading workflow builder" className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-[28rem] w-full" />
      </div>
    </PageContainer>
  ),
});
