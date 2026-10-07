import type { ListQuery } from '@nexus/api-client';
import { api } from '../_shared/api';
import type { WebhookFormValues } from './schemas';
import type { TestEventResult, Webhook, WebhookDelivery, WebhookWithSecret } from './types';

const base = '/webhooks';
const path = (id: string) => `${base}/${encodeURIComponent(id)}`;

export const webhooksService = {
  list: (query: ListQuery, signal?: AbortSignal) => api.list<Webhook>(base, query, { signal }),
  deliveries: (id: string, signal?: AbortSignal) => api.get<WebhookDelivery[]>(`${path(id)}/deliveries`, { signal }),
  create: (input: WebhookFormValues) => api.post<WebhookWithSecret>(base, input),
  update: (id: string, input: Partial<WebhookFormValues> & { enabled?: boolean }) => api.patch<Webhook>(path(id), input),
  rotateSecret: (id: string) => api.post<WebhookWithSecret>(`${path(id)}/rotate-secret`),
  sendTest: (id: string) => api.post<TestEventResult>(`${path(id)}/test`),
  remove: (id: string) => api.delete(path(id)),
};
