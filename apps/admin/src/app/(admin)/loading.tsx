import { PageContainer, Skeleton } from '@nexus/ui';

/** Route-level loading state shown while a page segment streams in. */
export default function Loading() {
  return (
    <PageContainer>
      <div role="status" aria-label="Loading page" className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </PageContainer>
  );
}
