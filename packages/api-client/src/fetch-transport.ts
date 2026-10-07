import { ApiError } from './errors';
import { buildQueryString } from './query';
import type { ApiEnvelope, Transport } from './types';

export interface FetchTransportOptions {
  baseUrl: string;
  /** Extra headers per request, e.g. a bearer token for token based auth. */
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  /** `include` (default) sends cookies for cookie based auth. */
  credentials?: RequestCredentials;
  timeoutMs?: number;
}

export function createFetchTransport({
  baseUrl,
  getHeaders,
  credentials = 'include',
  timeoutMs = 15_000,
}: FetchTransportOptions): Transport {
  return async ({ method, path, query, body, signal, headers }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new DOMException('Timeout', 'TimeoutError')), timeoutMs);
    const onAbort = () => controller.abort(signal?.reason);
    signal?.addEventListener('abort', onAbort);

    try {
      const response = await fetch(`${baseUrl}${path}${buildQueryString(query)}`, {
        method,
        credentials,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          // Forces a CORS preflight on cross-origin state-changing calls so cookie-authenticated
          // requests cannot be forged by a third-party page. The backend must require this header.
          ...(method !== 'GET' ? { 'X-Requested-With': 'XMLHttpRequest' } : {}),
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...(await getHeaders?.()),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      let parsed: ApiEnvelope | null = null;
      if (response.status !== 204) {
        try {
          parsed = (await response.json()) as ApiEnvelope;
        } catch {
          parsed = null; // Non-JSON error pages (proxies, gateways) are handled by status below.
        }
      }
      return { status: response.status, body: parsed };
    } catch (error) {
      if (signal?.aborted) throw error; // Caller cancelled (e.g. TanStack Query): propagate untouched.
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('TIMEOUT', 'The request timed out. Please try again.');
      }
      throw new ApiError('NETWORK_ERROR', 'Network error. Check your connection and try again.');
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  };
}
