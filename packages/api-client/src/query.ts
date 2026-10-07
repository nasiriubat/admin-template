import type { ListQuery, TransportRequest } from './types';

/** Flatten a {@link ListQuery} into the query-string parameters the API contract expects. */
export function listQueryToParams(query: ListQuery = {}): NonNullable<TransportRequest['query']> {
  const params: NonNullable<TransportRequest['query']> = {};
  if (query.page) params.page = query.page;
  if (query.pageSize) params.pageSize = query.pageSize;
  if (query.sort) params.sort = query.sort;
  if (query.direction) params.direction = query.direction;
  if (query.search?.trim()) params.search = query.search.trim();
  for (const [key, value] of Object.entries(query.filters ?? {})) {
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) continue;
    params[`filter[${key}]`] = value;
  }
  return params;
}

export function buildQueryString(query: TransportRequest['query'] = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach((v) => search.append(key, v));
    else search.append(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}
