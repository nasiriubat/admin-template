import { createDemoAuthAdapter, createHttpAuthAdapter, type AuthAdapter } from '@nexus/auth';
import { getRuntimeConfig } from '@nexus/config';

const runtime = getRuntimeConfig();

/** Demo sign-in locally; a real cookie-session backend when NEXT_PUBLIC_API_BASE_URL is set. */
export const authAdapter: AuthAdapter = runtime.demoMode
  ? createDemoAuthAdapter()
  : createHttpAuthAdapter({ baseUrl: runtime.apiBaseUrl });
