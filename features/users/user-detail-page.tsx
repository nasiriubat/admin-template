'use client';

import Link from 'next/link';
import { Avatar, Badge, Button, Card, CardContent, formatDateTime, formatRelative, IconRenderer, PageContainer, PageHeader, QueryBoundary, SetBreadcrumbs, Skeleton } from '@nexus/ui';
import { roleLabel } from '../_shared/roles';
import { useUser } from './hooks';

export function UserDetailPage({ id }: { id: string }) {
  const query = useUser(id);

  return (
    <PageContainer>
      {query.data && (
        <SetBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Users', href: '/users' }, { label: query.data.name }]} />
      )}
      <QueryBoundary
        query={query}
        loading={
          <div className="space-y-4">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-40 w-full" />
          </div>
        }
      >
        {(user) => (
          <>
            <PageHeader
              title={user.name}
              description={user.email}
              actions={
                <Button variant="secondary" asChild>
                  <Link href="/users">
                    <IconRenderer name="ArrowLeft" className="size-4" /> All users
                  </Link>
                </Button>
              }
            />
            <Card>
              <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]">
                <Avatar name={user.name} size="lg" />
                <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  <Detail label="Role" value={roleLabel(user.role)} />
                  <Detail
                    label="Status"
                    value={
                      <Badge variant={user.status === 'active' ? 'success' : user.status === 'invited' ? 'info' : 'danger'} dot className="capitalize">
                        {user.status}
                      </Badge>
                    }
                  />
                  <Detail label="Last active" value={user.lastActiveAt ? formatRelative(user.lastActiveAt) : 'Never'} />
                  <Detail label="Joined" value={formatDateTime(user.createdAt)} />
                </dl>
              </CardContent>
            </Card>
          </>
        )}
      </QueryBoundary>
    </PageContainer>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-text">{value}</dd>
    </div>
  );
}
