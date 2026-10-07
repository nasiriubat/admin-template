import { toApiError } from './errors';
import { listQueryToParams } from './query';
import type {
  ApiEnvelope,
  HttpMethod,
  ListQuery,
  PageMeta,
  Paginated,
  Transport,
  TransportRequest,
} from './types';

export interface RequestOptions {
  query?: TransportRequest['query'];
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface ApiClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  delete<T = void>(path: string, options?: RequestOptions): Promise<T>;
  /** GET a collection endpoint and return `{ items, meta }`. */
  list<T>(path: string, query?: ListQuery, options?: Omit<RequestOptions, 'query'>): Promise<Paginated<T>>;
  /** Hook for global handling, e.g. redirecting to /login on a 401. */
  onUnauthorized?: () => void;
}

export function createApiClient(transport: Transport, hooks: { onUnauthorized?: () => void } = {}): ApiClient {
  async function execute<T>(method: HttpMethod, path: string, body: unknown, options: RequestOptions = {}) {
    const response = await transport({ method, path, body, ...options });
    const envelope: ApiEnvelope<T> | null = response.body as ApiEnvelope<T> | null;
    if (response.status >= 400 || envelope?.error) {
      const error = toApiError(response.status, envelope?.error);
      if (error.isUnauthorized) hooks.onUnauthorized?.();
      throw error;
    }
    return envelope as ApiEnvelope<T> | null;
  }

  return {
    async get<T>(path: string, options?: RequestOptions) {
      return ((await execute<T>('GET', path, undefined, options))?.data ?? null) as T;
    },
    async post<T>(path: string, body?: unknown, options?: RequestOptions) {
      return ((await execute<T>('POST', path, body, options))?.data ?? null) as T;
    },
    async put<T>(path: string, body?: unknown, options?: RequestOptions) {
      return ((await execute<T>('PUT', path, body, options))?.data ?? null) as T;
    },
    async patch<T>(path: string, body?: unknown, options?: RequestOptions) {
      return ((await execute<T>('PATCH', path, body, options))?.data ?? null) as T;
    },
    async delete<T = void>(path: string, options?: RequestOptions) {
      return ((await execute<T>('DELETE', path, undefined, options))?.data ?? null) as T;
    },
    async list<T>(path: string, query?: ListQuery, options?: Omit<RequestOptions, 'query'>) {
      const envelope = await execute<T[]>('GET', path, undefined, { ...options, query: listQueryToParams(query) });
      const items = envelope?.data ?? [];
      const meta = (envelope?.meta as Partial<PageMeta> | undefined) ?? {};
      const pageSize = meta.pageSize ?? query?.pageSize ?? (items.length || 1);
      const total = meta.total ?? items.length;
      return {
        items,
        meta: {
          page: meta.page ?? query?.page ?? 1,
          pageSize,
          total,
          pages: meta.pages ?? Math.max(1, Math.ceil(total / pageSize)),
        },
      };
    },
    onUnauthorized: hooks.onUnauthorized,
  };
}
