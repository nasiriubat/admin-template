import { describe, expect, it } from 'vitest';
import { describeDay, formatMinutes, formatUptime, incidentDurationMinutes, overallHeadline, overallStatus, splitIncidents, summarizeHistory } from './health-utils';
import type { DayUptime, Incident } from './types';

const day = (date: string, status: DayUptime['status'], uptimePct = 100): DayUptime => ({ date, status, uptimePct });

describe('overallStatus', () => {
  it('is operational when empty or all healthy', () => {
    expect(overallStatus([])).toBe('operational');
    expect(overallStatus([{ status: 'operational' }])).toBe('operational');
  });
  it('picks the worst status', () => {
    expect(overallStatus([{ status: 'degraded' }, { status: 'operational' }])).toBe('degraded');
    expect(overallStatus([{ status: 'degraded' }, { status: 'outage' }])).toBe('outage');
  });
  it('writes a headline', () => {
    expect(overallHeadline([{ name: 'API', status: 'operational' }])).toBe('All systems operational');
    expect(overallHeadline([{ name: 'API', status: 'degraded' }])).toBe('Degraded performance on 1 service');
    expect(overallHeadline([{ name: 'API', status: 'outage' }, { name: 'DB', status: 'outage' }])).toBe('Outage affecting 2 services');
  });
});

describe('formatUptime', () => {
  it('does not round up to 100', () => {
    expect(formatUptime(99.999)).toBe('99.99%');
    expect(formatUptime(99.98)).toBe('99.98%');
    expect(formatUptime(100)).toBe('100%');
  });
});

describe('history text alternatives', () => {
  it('describes a day', () => {
    expect(describeDay(day('2026-03-04', 'degraded', 98.5))).toContain('Degraded, 98.50% uptime');
  });
  it('summarises the strip', () => {
    expect(summarizeHistory('API', [day('2026-03-01', 'operational'), day('2026-03-02', 'operational')])).toBe('API: operational on all 2 days.');
    expect(summarizeHistory('API', [day('a', 'degraded'), day('b', 'outage'), day('c', 'degraded')])).toBe('API: 1 day with an outage and 2 days degraded in the last 3 days.');
  });
});

describe('incidents', () => {
  const base = { serviceIds: ['api'], severity: 'degraded' as const, updates: [] };
  const incidents: Incident[] = [
    { ...base, id: 'a', title: 'A', status: 'resolved', startedAt: '2026-03-01T10:00:00Z', resolvedAt: '2026-03-01T11:30:00Z' },
    { ...base, id: 'b', title: 'B', status: 'monitoring', startedAt: '2026-03-05T10:00:00Z', resolvedAt: null },
    { ...base, id: 'c', title: 'C', status: 'resolved', startedAt: '2026-03-03T10:00:00Z', resolvedAt: '2026-03-03T10:20:00Z' },
  ];
  it('splits and sorts newest first', () => {
    const { open, resolved } = splitIncidents(incidents);
    expect(open.map((i) => i.id)).toEqual(['b']);
    expect(resolved.map((i) => i.id)).toEqual(['c', 'a']);
  });
  it('computes durations', () => {
    expect(incidentDurationMinutes(incidents[0])).toBe(90);
    expect(incidentDurationMinutes(incidents[1], Date.parse('2026-03-05T10:45:00Z'))).toBe(45);
  });
  it('formats minutes', () => {
    expect(formatMinutes(20)).toBe('20 min');
    expect(formatMinutes(120)).toBe('2 h');
    expect(formatMinutes(90)).toBe('1 h 30 min');
  });
});
