export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  /** Field-level validation messages, keyed by field name. */
  fields?: Record<string, string>;
}

/** Standard response envelope (docs/API_CONTRACT.md). */
export interface ApiEnvelope<T = unknown, M = Record<string, unknown>> {
  data: T | null;
  meta?: M;
  error: ApiErrorBody | null;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

export type SortDirection = 'asc' | 'desc';

export interface ListQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
  direction?: SortDirection;
  search?: string;
  /** Field filters; array values mean "one of". */
  filters?: Record<string, string | string[] | undefined>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface TransportRequest {
  method: HttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | string[] | undefined>;
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface TransportResponse {
  status: number;
  body: ApiEnvelope | null;
}

/** Anything that can execute a request: the real fetch transport or the demo mock. */
export type Transport = (request: TransportRequest) => Promise<TransportResponse>;
