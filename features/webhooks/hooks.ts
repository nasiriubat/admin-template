'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { ListQuery, Paginated } from '@nexus/api-client';
import type { WebhookFormValues } from './schemas';
import { webhooksService } from './service';
import type { Webhook, WebhookWithSecret } from './types';
import { applyEnabled, patchWebhookInPage } from './webhook-utils';

export const webhookKeys = {
  all: ['webhooks'] as const,
  list: (query: ListQuery) => ['webhooks', 'list', query] as const,
  deliveries: (id: string) => ['webhooks', 'deliveries', id] as const,
};

export function useWebhooks(query: ListQuery) {
  return useQuery({
    queryKey: webhookKeys.list(query),
    queryFn: ({ signal }) => webhooksService.list(query, signal),
    placeholderData: keepPreviousData,
  });
}

export function useWebhookDeliveries(id: string) {
  return useQuery({ queryKey: webhookKeys.deliveries(id), queryFn: ({ signal }) => webhooksService.deliveries(id, signal) });
}

/**
 * Calls that return a signing secret (create, rotate) bypass `useMutation` so the secret is never
 * retained in TanStack's mutation cache. Callers keep it in component state until the reveal
 * dialog closes.
 */
function useSecretAction<TArgs extends unknown[]>(fn: (...args: TArgs) => Promise<WebhookWithSecret>) {
  const qc = useQueryClient();
  const [isPending, setPending] = useState(false);
  const run = useCallback(
    async (...args: TArgs) => {
      setPending(true);
      try {
        const result = await fn(...args);
        await qc.invalidateQueries({ queryKey: webhookKeys.all });
        return result;
      } finally {
        setPending(false);
      }
    },
    [fn, qc],
  );
  return { run, isPending };
}

export const useCreateWebhook = () => useSecretAction((input: WebhookFormValues) => webhooksService.create(input));
export const useRotateSecret = () => useSecretAction((id: string) => webhooksService.rotateSecret(id));

function useInvalidatingMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: webhookKeys.all }) });
}

export const useUpdateWebhook = () =>
  useInvalidatingMutation(({ id, input }: { id: string; input: Parameters<typeof webhooksService.update>[1] }) => webhooksService.update(id, input));
export const useDeleteWebhook = () => useInvalidatingMutation(webhooksService.remove);

export function useSendTestEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: webhooksService.sendTest,
    onSettled: (_data, _error, id) => {
      void qc.invalidateQueries({ queryKey: webhookKeys.deliveries(id) });
      void qc.invalidateQueries({ queryKey: ['webhooks', 'list'] });
    },
  });
}

/** Optimistic enable/disable with rollback. */
export function useToggleWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => webhooksService.update(id, { enabled }),
    onMutate: async ({ id, enabled }) => {
      await qc.cancelQueries({ queryKey: ['webhooks', 'list'] });
      const previous = qc.getQueriesData<Paginated<Webhook>>({ queryKey: ['webhooks', 'list'] });
      qc.setQueriesData<Paginated<Webhook>>({ queryKey: ['webhooks', 'list'] }, (page) => patchWebhookInPage(page, id, (w) => applyEnabled(w, enabled)));
      return { previous };
    },
    onError: (_e, _v, context) => context?.previous.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSettled: () => qc.invalidateQueries({ queryKey: webhookKeys.all }),
  });
}
