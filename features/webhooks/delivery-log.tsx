'use client';

import { Badge, Button, formatRelative, QueryBoundary, Skeleton } from '@nexus/ui';
import { useWebhookDeliveries } from './hooks';
import type { Webhook } from './types';
import { maskSecret } from './webhook-utils';

/** Expanded row content: signing secret metadata plus recent deliveries. */
export function DeliveryLog({ webhook }: { webhook: Webhook }) {
  const query = useWebhookDeliveries(webhook.id);
  return (
    <div className="space-y-3 text-left">
      <p className="text-xs text-text-muted">
        Signing secret <code className="font-mono text-text">{maskSecret(webhook)}</code>
      </p>
      <h4 className="text-sm font-semibold text-text">Recent deliveries</h4>
      <QueryBoundary
        query={query}
        isEmpty={(d) => d.length === 0}
        loading={<Skeleton className="h-24 w-full" />}
        empty={<p className="text-sm text-text-muted">No deliveries yet. Send a test event to see one here.</p>}
      >
        {(deliveries) => (
          <>
            <ul className="divide-y divide-border rounded-input border border-border bg-surface md:hidden">
              {deliveries.map((d) => (
                <li key={d.id} className="space-y-1 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-xs">{d.event}</span>
                    <Badge variant={d.success ? 'success' : 'danger'}>{d.statusCode}</Badge>
                  </div>
                  <p className="text-xs text-text-muted">
                    {d.durationMs} ms · {formatRelative(d.timestamp)} · {d.attempt > 1 ? `Retry ${d.attempt - 1}` : 'First attempt'}
                  </p>
                </li>
              ))}
            </ul>
            <table className="hidden w-full text-sm md:table">
              <caption className="sr-only">Recent deliveries for {webhook.url}</caption>
              <thead>
                <tr className="text-left text-xs text-text-muted">
                  <th scope="col" className="py-1.5 pr-3 font-medium">Event</th>
                  <th scope="col" className="py-1.5 pr-3 font-medium">Status</th>
                  <th scope="col" className="py-1.5 pr-3 font-medium">Duration</th>
                  <th scope="col" className="py-1.5 pr-3 font-medium">Attempt</th>
                  <th scope="col" className="py-1.5 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deliveries.map((d) => (
                  <tr key={d.id}>
                    <td className="py-1.5 pr-3 font-mono text-xs">{d.event}</td>
                    <td className="py-1.5 pr-3"><Badge variant={d.success ? 'success' : 'danger'}>{d.statusCode}</Badge></td>
                    <td className="py-1.5 pr-3 tabular-nums">{d.durationMs} ms</td>
                    <td className="py-1.5 pr-3">{d.attempt > 1 ? `Retry ${d.attempt - 1}` : 'First attempt'}</td>
                    <td className="py-1.5 text-text-muted">{formatRelative(d.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </QueryBoundary>
      <Button variant="ghost" size="sm" onClick={() => void query.refetch()} loading={query.isFetching && !query.isPending}>Refresh</Button>
    </div>
  );
}
