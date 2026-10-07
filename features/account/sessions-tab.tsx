'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Badge, Button, Card, ConfirmDialog, DataTable, formatDateTime, formatRelative, IconRenderer, QueryBoundary, Skeleton, toast, useTableQuery } from '@nexus/ui';
import { useLoginHistory, useRevokeSession, useSessions } from './hooks';
import { deviceIcon, type AccountSession, type LoginEvent } from './types';

const col = createColumnHelper<LoginEvent>();

function SessionsSkeleton() {
  return (
    <Card className="divide-y divide-border">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/2" /></div>
        </div>
      ))}
    </Card>
  );
}

export function SessionList() {
  const sessions = useSessions();
  const revoke = useRevokeSession();
  const [target, setTarget] = useState<AccountSession | null>(null);

  return (
    <section aria-labelledby="sessions-heading" className="space-y-3">
      <div>
        <h2 id="sessions-heading" className="text-base font-semibold text-text">Active sessions</h2>
        <p className="text-sm text-text-muted">Browsers and devices currently signed in to your account.</p>
      </div>
      <QueryBoundary query={sessions} loading={<SessionsSkeleton />}>
        {(items) => (
          <Card>
            <ul className="divide-y divide-border" aria-label="Active sessions">
              {items.map((s) => (
                <li key={s.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <IconRenderer name={deviceIcon(s.device)} className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-text">
                        {s.device} · {s.browser}
                        {s.current && <Badge variant="success" dot>This device</Badge>}
                      </p>
                      <p className="text-xs text-text-muted">{s.os} · {s.ip} · {s.location}</p>
                      <p className="text-xs text-text-muted">{s.current ? 'Active now' : `Last active ${formatRelative(s.lastActiveAt)}`}</p>
                    </div>
                  </div>
                  {!s.current && (
                    <Button variant="secondary" size="sm" onClick={() => setTarget(s)} aria-label={`Revoke session on ${s.device}, ${s.browser}`}>
                      Revoke
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </QueryBoundary>
      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Revoke this session?"
        description={target ? `${target.device} (${target.browser}) near ${target.location} will be signed out right away.` : ''}
        confirmLabel="Revoke session"
        onConfirm={async () => {
          if (!target) return;
          await revoke.mutateAsync(target.id);
          toast.success('Session revoked', { description: target.device });
        }}
      />
    </section>
  );
}

export function LoginHistory() {
  const history = useLoginHistory();
  const { query, setQuery } = useTableQuery({ pageSize: 10 });

  const columns = useMemo(
    () => [
      col.accessor('at', {
        header: 'When',
        cell: (c) => formatDateTime(c.getValue()),
        meta: { mobile: 'primary', alwaysVisible: true, exportValue: (e: LoginEvent) => e.at },
      }),
      col.accessor('success', {
        header: 'Result',
        cell: (c) => <Badge variant={c.getValue() ? 'success' : 'danger'} dot>{c.getValue() ? 'Success' : 'Failed'}</Badge>,
        meta: { exportValue: (e: LoginEvent) => (e.success ? 'Success' : 'Failed') },
      }),
      col.accessor('reason', { header: 'Details', cell: (c) => c.getValue() ?? <span className="text-text-muted">Signed in</span>, meta: { exportValue: (e: LoginEvent) => e.reason ?? '' } }),
      col.accessor('ip', { header: 'IP address' }),
      col.accessor('location', { header: 'Location' }),
      col.accessor((e) => `${e.browser} on ${e.os}`, { id: 'device', header: 'Device' }),
    ],
    [],
  );

  return (
    <section aria-labelledby="history-heading" className="space-y-3">
      <div>
        <h2 id="history-heading" className="text-base font-semibold text-text">Login history</h2>
        <p className="text-sm text-text-muted">Your last 20 sign-in attempts, including failures.</p>
      </div>
      <DataTable<LoginEvent>
        caption="Login history"
        columns={columns}
        data={history.data ?? []}
        getRowId={(e) => e.id}
        getRowLabel={(e) => formatDateTime(e.at)}
        mode="client"
        query={query}
        onQueryChange={setQuery}
        isLoading={history.isPending}
        error={history.error}
        onRetry={() => void history.refetch()}
        searchPlaceholder="Search by IP or location"
        exportFileName="login-history"
        emptyTitle="No sign-ins recorded"
        emptyDescription="Sign-in attempts will appear here."
      />
    </section>
  );
}
