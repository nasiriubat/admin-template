import { describe, expect, it, vi } from 'vitest';
import { ApiError, buildQueryString, createApiClient, createCollection, createMockRouter, listQueryToParams } from './index';

describe('query helpers', () => {
  it('drops empty filters and trims search', () => {
    expect(listQueryToParams({ page: 2, search: '  ann ', filters: { role: ['a', 'b'], status: '', x: undefined, y: [] } })).toEqual({
      page: 2,
      search: 'ann',
      'filter[role]': ['a', 'b'],
    });
  });
  it('encodes arrays as repeated params', () => {
    expect(buildQueryString({ a: ['1', '2'], b: 'x y' })).toBe('?a=1&a=2&b=x+y');
  });
});

describe('createApiClient', () => {
  it('unwraps data and maps errors, notifying on 401', async () => {
    const onUnauthorized = vi.fn();
    const client = createApiClient(
      async ({ path }) =>
        path === '/ok'
          ? { status: 200, body: { data: { hi: 1 }, error: null } }
          : { status: 401, body: { data: null, error: { code: 'UNAUTHENTICATED', message: 'nope' } } },
      { onUnauthorized },
    );
    await expect(client.get('/ok')).resolves.toEqual({ hi: 1 });
    await expect(client.get('/secret')).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('classifies retryable errors', async () => {
    const client = createApiClient(async () => ({ status: 503, body: null }));
    const error = (await client.get('/x').catch((e) => e)) as ApiError;
    expect(error.code).toBe('SERVER_ERROR');
    expect(error.isRetryable).toBe(true);
  });
});

describe('mock collection', () => {
  const rows = Array.from({ length: 25 }, (_, i) => ({ id: String(i), name: `User ${String(i).padStart(2, '0')}`, role: i % 2 ? 'admin' : 'viewer' }));
  const collection = createCollection(rows, { searchFields: ['name'], filterFields: ['role'] });

  it('paginates, filters, searches and sorts', () => {
    const page = collection.list({ page: 2, pageSize: 10, sort: 'name', direction: 'desc', 'filter[role]': 'admin' });
    expect(page.__meta).toMatchObject({ page: 2, pageSize: 10, total: 12, pages: 2 });
    expect(page.data).toHaveLength(2);
    expect(collection.list({ search: 'user 07' }).data.map((r) => r.id)).toEqual(['7']);
  });

  it('ignores filters on fields that are not allow-listed', () => {
    expect(collection.list({ 'filter[id]': '3', pageSize: 100 }).data).toHaveLength(25);
  });

  it('serves 404 for missing routes and records through the router', async () => {
    const router = createMockRouter();
    router.on('GET', '/things/:id', ({ params }) => collection.get(params.id));
    const client = createApiClient(router.transport({ latencyMs: 0 }));
    await expect(client.get('/things/3')).resolves.toMatchObject({ id: '3' });
    await expect(client.get('/things/999')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(client.get('/missing')).rejects.toMatchObject({ status: 404 });
  });
});

describe('fetch transport CSRF header', () => {
  it('sends X-Requested-With on state-changing requests only', async () => {
    const { createFetchTransport } = await import('./fetch-transport');
    const seen: Array<Record<string, string>> = [];
    const original = globalThis.fetch;
    globalThis.fetch = (async (_url: string, init: RequestInit) => {
      seen.push(init.headers as Record<string, string>);
      return new Response(JSON.stringify({ data: null, error: null }), { status: 200 });
    }) as typeof fetch;
    try {
      const transport = createFetchTransport({ baseUrl: 'https://api.test' });
      await transport({ method: 'GET', path: '/a' });
      await transport({ method: 'POST', path: '/b' });
      expect(seen[0]['X-Requested-With']).toBeUndefined();
      expect(seen[1]['X-Requested-With']).toBe('XMLHttpRequest');
    } finally {
      globalThis.fetch = original;
    }
  });
});
