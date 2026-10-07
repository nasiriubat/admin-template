import { ApiError } from './errors';
import type { ApiEnvelope, ListQuery, PageMeta, SortDirection, Transport, TransportRequest } from './types';

interface Paged {
  __meta: Record<string, unknown>;
  data: unknown;
}

const isPaged = (value: unknown): value is Paged => typeof value === 'object' && value !== null && '__meta' in value;

type Handler = (ctx: {
  params: Record<string, string>;
  query: NonNullable<TransportRequest['query']>;
  body: unknown;
}) => unknown;

interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler;
}

export interface MockRouter {
  on(method: TransportRequest['method'], path: string, handler: Handler): void;
  transport(options?: { latencyMs?: number; jitterMs?: number }): Transport;
}

/** Tiny in-memory HTTP router used by demo mode and tests. Mirrors the real envelope shape. */
export function createMockRouter(): MockRouter {
  const routes: Route[] = [];
  return {
    on(method, path, handler) {
      const keys: string[] = [];
      const source = path.replace(/:([A-Za-z]+)/g, (_, key: string) => {
        keys.push(key);
        return '([^/]+)';
      });
      routes.push({ method, pattern: new RegExp(`^${source}$`), keys, handler });
    },
    transport({ latencyMs = 280, jitterMs = 160 } = {}) {
      return async ({ method, path, query = {}, body, signal }) => {
        if (latencyMs > 0) {
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(resolve, latencyMs + Math.random() * jitterMs);
            signal?.addEventListener('abort', () => {
              clearTimeout(timer);
              reject(signal.reason);
            });
          });
        }
        for (const route of routes) {
          if (route.method !== method) continue;
          const match = route.pattern.exec(path);
          if (!match) continue;
          const params = Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(match[i + 1])]));
          try {
            const result = route.handler({ params, query, body });
            const envelope: ApiEnvelope = isPaged(result)
              ? { data: result.data, meta: result.__meta, error: null }
              : { data: result ?? null, error: null };
            return { status: 200, body: envelope };
          } catch (error) {
            if (error instanceof ApiError) {
              return {
                status: error.status,
                body: { data: null, error: { code: error.code, message: error.message, fields: error.fields } },
              };
            }
            throw error;
          }
        }
        return { status: 404, body: { data: null, error: { code: 'NOT_FOUND', message: `No mock route for ${method} ${path}` } } };
      };
    },
  };
}

export interface CollectionOptions<T> {
  /** Fields matched by the free-text `search` parameter. */
  searchFields: Array<keyof T>;
  /** Fields allowed in `filter[...]` parameters (exact match, array means one-of). */
  filterFields?: Array<keyof T>;
  defaultSort?: { field: keyof T; direction: SortDirection };
}

/** In-memory collection with the list semantics from docs/API_CONTRACT.md. */
export function createCollection<T extends { id: string }>(seed: T[], options: CollectionOptions<T>) {
  let rows = [...seed];
  let counter = seed.length;

  const compare = (a: unknown, b: unknown) => {
    if (a === b) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
  };

  return {
    all: () => rows,
    reset: () => {
      rows = [...seed];
    },
    list(query: NonNullable<TransportRequest['query']>) {
      let result = rows;
      const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : '';
      if (search) {
        result = result.filter((row) =>
          options.searchFields.some((f) => String(row[f] ?? '').toLowerCase().includes(search)),
        );
      }
      for (const [key, raw] of Object.entries(query)) {
        const match = /^filter\[(.+)\]$/.exec(key);
        if (!match || raw === undefined) continue;
        const field = match[1] as keyof T;
        if (options.filterFields && !options.filterFields.includes(field)) continue;
        const allowed = Array.isArray(raw) ? raw.map(String) : [String(raw)];
        result = result.filter((row) => allowed.includes(String(row[field])));
      }
      const sortField = (typeof query.sort === 'string' ? query.sort : undefined) ?? (options.defaultSort?.field as string | undefined);
      const direction = ((query.direction as SortDirection | undefined) ?? options.defaultSort?.direction ?? 'asc') as SortDirection;
      if (sortField) {
        result = [...result].sort((a, b) => {
          const c = compare(a[sortField as keyof T], b[sortField as keyof T]);
          return direction === 'desc' ? -c : c;
        });
      }
      const pageSize = Math.min(Math.max(Number(query.pageSize) || 10, 1), 100);
      const total = result.length;
      const pages = Math.max(1, Math.ceil(total / pageSize));
      const page = Math.min(Math.max(Number(query.page) || 1, 1), pages);
      const meta: PageMeta = { page, pageSize, total, pages };
      return { __meta: meta as unknown as Record<string, unknown>, data: result.slice((page - 1) * pageSize, page * pageSize) };
    },
    get(id: string) {
      const row = rows.find((r) => r.id === id);
      if (!row) throw new ApiError('NOT_FOUND', 'Record not found.', 404);
      return row;
    },
    create(input: Omit<T, 'id'> & { id?: string }) {
      counter += 1;
      const row = { ...input, id: input.id ?? `new-${counter}-${Date.now().toString(36)}` } as T;
      rows = [row, ...rows];
      return row;
    },
    update(id: string, patch: Partial<T>) {
      const index = rows.findIndex((r) => r.id === id);
      if (index === -1) throw new ApiError('NOT_FOUND', 'Record not found.', 404);
      rows[index] = { ...rows[index], ...patch, id };
      return rows[index];
    },
    remove(id: string) {
      if (!rows.some((r) => r.id === id)) throw new ApiError('NOT_FOUND', 'Record not found.', 404);
      rows = rows.filter((r) => r.id !== id);
      return { id };
    },
  };
}

export type { ListQuery };
