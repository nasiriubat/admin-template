import type { Paginated } from '@nexus/api-client';
import type { Webhook, WebhookStatus } from './types';

export const FAILING_THRESHOLD = 80;

export function deriveWebhookStatus(w: Pick<Webhook, 'enabled' | 'successRate' | 'lastDeliveryAt'>): WebhookStatus {
  if (!w.enabled) return 'disabled';
  return w.lastDeliveryAt && w.successRate < FAILING_THRESHOLD ? 'failing' : 'enabled';
}

export const maskSecret = (w: Pick<Webhook, 'secretPrefix' | 'secretLast4'>) => `${w.secretPrefix}••••${w.secretLast4}`;

export function toggleItem(list: readonly string[], item: string, checked: boolean): string[] {
  const set = new Set(list);
  if (checked) set.add(item);
  else set.delete(item);
  return [...set];
}

/** Optimistic enable/disable: recompute the derived status the way the server will. */
export function applyEnabled(w: Webhook, enabled: boolean): Webhook {
  const next = { ...w, enabled };
  return { ...next, status: deriveWebhookStatus(next) };
}

export function patchWebhookInPage(page: Paginated<Webhook> | undefined, id: string, fn: (w: Webhook) => Webhook) {
  if (!page) return page;
  return { ...page, items: page.items.map((w) => (w.id === id ? fn(w) : w)) };
}

export const isSuccessCode = (code: number) => code >= 200 && code < 300;

export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
