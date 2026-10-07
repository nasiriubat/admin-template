import { createApiClient, createFetchTransport, type Transport } from '@nexus/api-client';
import { getRuntimeConfig } from '@nexus/config';
import { mockRouter } from './mock-router';

export const UNAUTHORIZED_EVENT = 'nexus:unauthorized';

const runtime = getRuntimeConfig();

function createTransport(): Transport {
  if (!runtime.demoMode) return createFetchTransport({ baseUrl: runtime.apiBaseUrl });
  const mock = mockRouter.transport();
  let loaded: Promise<unknown> | null = null;
  return async (request) => {
    loaded ??= import('./register-mocks');
    await loaded;
    return mock(request);
  };
}

/**
 * The one API client features use. Points at the configured backend, or at the in-memory demo
 * API when `NEXT_PUBLIC_DEMO_MODE` is on (or no API base URL is configured).
 */
export const api = createApiClient(createTransport(), {
  onUnauthorized: () => {
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
  },
});

export const isDemoMode = runtime.demoMode;
