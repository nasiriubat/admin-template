import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRuntimeConfig } from './runtime';

afterEach(() => vi.unstubAllEnvs());

describe('getRuntimeConfig demo mode fails closed in production', () => {
  it('defaults to demo in development when no backend is configured', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '');
    expect(getRuntimeConfig().demoMode).toBe(true);
  });
  it('never defaults to demo in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', '');
    expect(getRuntimeConfig().demoMode).toBe(false);
  });
  it('requires the explicit flag to enable demo in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true');
    expect(getRuntimeConfig().demoMode).toBe(true);
  });
  it('is off when a backend is configured', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.com/');
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', '');
    const cfg = getRuntimeConfig();
    expect(cfg.demoMode).toBe(false);
    expect(cfg.apiBaseUrl).toBe('https://api.example.com');
  });
});
