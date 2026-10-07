/**
 * Runtime environment helpers. Only `NEXT_PUBLIC_*` values are readable in the browser, and
 * Next.js inlines them at build time, so each variable must be referenced literally.
 */
export interface RuntimeConfig {
  appName: string;
  apiBaseUrl: string;
  defaultTheme: string;
  /** True when the built-in in-memory API and demo sign-in are active. Never use in production. */
  demoMode: boolean;
}

export function getRuntimeConfig(): RuntimeConfig {
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/+$/, '');
  const demoFlag = process.env.NEXT_PUBLIC_DEMO_MODE;
  // Fail closed: production builds are in demo mode ONLY when explicitly requested with
  // NEXT_PUBLIC_DEMO_MODE=true. In development and tests, demo mode is the default when no
  // backend is configured so a fresh clone runs out of the box.
  const isProduction = process.env.NODE_ENV === 'production';
  const demoMode = demoFlag === 'true' || (demoFlag !== 'false' && apiBaseUrl === '' && !isProduction);
  return {
    appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Nexus Admin',
    apiBaseUrl,
    defaultTheme: process.env.NEXT_PUBLIC_DEFAULT_THEME?.trim() || 'modern-saas',
    demoMode,
  };
}
