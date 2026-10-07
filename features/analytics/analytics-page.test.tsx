import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AnalyticsReport } from './types';

const report = (range: string): AnalyticsReport => ({
  range: range as AnalyticsReport['range'],
  metrics: {
    visitors: { value: 12000, delta: 5, series: [1, 2, 3] },
    signups: { value: 400, delta: -2, series: [1, 2, 3] },
    conversionRate: { value: 3.3, delta: 1, series: [1, 2, 3] },
    avgSessionSeconds: { value: 185, delta: 0, series: [1, 2, 3] },
  },
  timeline: [{ date: '2026-01-01', visitors: 100, signups: 3 }],
  sessionsByWeekday: [{ day: 'Mon', sessions: 10 }],
  sources: [{ name: 'Direct', value: 10 }],
  topPages: [{ path: '/pricing', views: 900, visitors: 700, bounceRate: 40, avgSeconds: 90 }],
});

const report$ = vi.fn(async (range: string) => report(range));
vi.mock('./service', () => ({ analyticsService: { report: (range: string) => report$(range) } }));
// gsap is only used by marketing components pulled in via the @nexus/ui barrel.
vi.mock('gsap', () => ({ gsap: { registerPlugin: () => undefined } }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));
vi.mock('recharts', async () => {
  const Stub = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return new Proxy({}, { get: () => Stub });
});

import { AnalyticsPage } from './analytics-page';

describe('AnalyticsPage', () => {
  it('renders metrics and top pages, and refetches when the range changes', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <AnalyticsPage />
      </QueryClientProvider>,
    );
    expect(await screen.findByText('3m 05s')).toBeTruthy();
    expect(screen.getAllByText('/pricing').length).toBeGreaterThan(0);
    expect(screen.getByRole('radiogroup', { name: 'Date range' })).toBeTruthy();
    fireEvent.click(screen.getByLabelText('7 days'));
    await waitFor(() => expect(report$).toHaveBeenCalledWith('7d'));
  });
});
