import { describe, expect, it } from 'vitest';
import { buildPreset, describeCron, detectPreset, getTimeZones, isValidTimeZone, nextRuns, parseCron, validateCron } from './cron';

const iso = (dates: Date[]) => dates.map((d) => d.toISOString());

describe('parseCron', () => {
  it('expands lists, ranges and steps', () => {
    const r = parseCron('0,30 9-11 */10 1-3 MON-FRI');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.cron.minutes).toEqual([0, 30]);
    expect(r.cron.hours).toEqual([9, 10, 11]);
    expect(r.cron.daysOfMonth).toEqual([1, 11, 21, 31]);
    expect(r.cron.months).toEqual([1, 2, 3]);
    expect(r.cron.daysOfWeek).toEqual([1, 2, 3, 4, 5]);
  });

  it('supports names, 7 as Sunday and open-ended steps', () => {
    const r = parseCron('5/20 0 1 jan,DEC 7');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.cron.minutes).toEqual([5, 25, 45]);
    expect(r.cron.months).toEqual([1, 12]);
    expect(r.cron.daysOfWeek).toEqual([0]);
  });

  it.each([
    ['* * * *', /5 fields/],
    ['* * * * * *', /5 fields/],
    ['60 * * * *', /out of range/],
    ['* 24 * * *', /out of range/],
    ['* * 0 * *', /out of range/],
    ['* * * 13 *', /out of range/],
    ['* * * * 8', /out of range/],
    ['*/0 * * * *', /positive/],
    ['5-1 * * * *', /backwards/],
    ['a * * * *', /Unknown value/],
    ['1,,2 * * * *', /Empty list/],
    ['1/2/3 * * * *', /Too many/],
    ['', /5 fields/],
  ])('rejects %j', (expr, message) => {
    expect(validateCron(expr)).toMatch(message);
  });

  it('accepts a valid expression with extra whitespace', () => {
    expect(validateCron('  0   9  * *   1-5 ')).toBeNull();
  });
});

describe('nextRuns', () => {
  const from = new Date('2026-03-04T10:07:30Z'); // a Wednesday

  it('returns every 15 minutes in order, strictly after the start', () => {
    expect(iso(nextRuns('*/15 * * * *', 'UTC', 3, from))).toEqual(['2026-03-04T10:15:00.000Z', '2026-03-04T10:30:00.000Z', '2026-03-04T10:45:00.000Z']);
  });

  it('does not return the current minute when it is exactly on the boundary', () => {
    const exact = new Date('2026-03-04T10:15:00Z');
    expect(nextRuns('*/15 * * * *', 'UTC', 1, exact)[0].toISOString()).toBe('2026-03-04T10:30:00.000Z');
  });

  it('handles weekdays and skips the weekend', () => {
    const friday = new Date('2026-03-06T12:00:00Z');
    expect(iso(nextRuns('0 9 * * 1-5', 'UTC', 3, friday))).toEqual(['2026-03-09T09:00:00.000Z', '2026-03-10T09:00:00.000Z', '2026-03-11T09:00:00.000Z']);
  });

  it('applies the time zone offset', () => {
    expect(nextRuns('0 9 * * *', 'Asia/Kolkata', 1, from)[0].toISOString()).toBe('2026-03-05T03:30:00.000Z');
    expect(nextRuns('0 9 * * *', 'America/New_York', 1, from)[0].toISOString()).toBe('2026-03-04T14:00:00.000Z');
  });

  it('uses OR semantics when both day-of-month and day-of-week are restricted', () => {
    const runs = nextRuns('0 0 13 * 5', 'UTC', 3, new Date('2026-03-01T00:00:00Z'));
    expect(iso(runs)).toEqual(['2026-03-06T00:00:00.000Z', '2026-03-13T00:00:00.000Z', '2026-03-20T00:00:00.000Z']);
  });

  it('finds Feb 29 across years', () => {
    const [run] = nextRuns('0 0 29 2 *', 'UTC', 1, new Date('2026-03-01T00:00:00Z'));
    expect(run.toISOString()).toBe('2028-02-29T00:00:00.000Z');
  });

  it('returns an empty list for impossible dates, invalid input or a bad zone', () => {
    expect(nextRuns('0 0 31 2 *', 'UTC', 3, from)).toEqual([]);
    expect(nextRuns('nope', 'UTC', 3, from)).toEqual([]);
    expect(nextRuns('0 0 * * *', 'Mars/Olympus', 3, from)).toEqual([]);
  });

  it('is DST safe: skips a nonexistent spring-forward time and keeps the local hour afterwards', () => {
    // US clocks jump from 02:00 to 03:00 on 2026-03-08 in New York; 02:30 does not exist that day.
    const runs = nextRuns('30 2 * * *', 'America/New_York', 3, new Date('2026-03-07T00:00:00Z'));
    expect(iso(runs)).toEqual(['2026-03-07T07:30:00.000Z', '2026-03-09T06:30:00.000Z', '2026-03-10T06:30:00.000Z']);
  });

  it('is DST safe: an ambiguous fall-back time fires once, at the first occurrence', () => {
    // 01:30 happens twice on 2026-11-01 in New York (05:30Z then 06:30Z).
    const runs = nextRuns('30 1 * * *', 'America/New_York', 2, new Date('2026-11-01T00:00:00Z'));
    expect(iso(runs)).toEqual(['2026-11-01T05:30:00.000Z', '2026-11-02T06:30:00.000Z']);
  });
});

describe('presets and descriptions', () => {
  it('builds and detects every preset', () => {
    expect(buildPreset('every-15')).toBe('*/15 * * * *');
    expect(buildPreset('hourly')).toBe('0 * * * *');
    expect(buildPreset('daily', { time: '07:05', weekday: 1, dayOfMonth: 1 })).toBe('5 7 * * *');
    expect(buildPreset('weekdays')).toBe('0 9 * * 1-5');
    expect(buildPreset('weekly', { time: '18:30', weekday: 5, dayOfMonth: 1 })).toBe('30 18 * * 5');
    expect(buildPreset('monthly', { time: '06:00', weekday: 1, dayOfMonth: 15 })).toBe('0 6 15 * *');
    expect(detectPreset('30 18 * * 5')).toEqual({ kind: 'weekly', options: { time: '18:30', weekday: 5, dayOfMonth: 1 } });
    expect(detectPreset('0 6 15 * *').kind).toBe('monthly');
    expect(detectPreset('0 9 * * 1,3').kind).toBe('custom');
  });

  it('describes expressions in plain English', () => {
    expect(describeCron('0 9 * * 1-5')).toBe('Every weekday at 09:00');
    expect(describeCron('*/15 * * * *')).toBe('Every 15 minutes');
    expect(describeCron('0 * * * *')).toBe('Every hour, on the hour');
    expect(describeCron('15 6 * * *')).toBe('Every day at 06:15');
    expect(describeCron('0 8 * * 1')).toBe('Every Monday at 08:00');
    expect(describeCron('0 6 1 * *')).toBe('On the 1st of every month at 06:00');
    expect(describeCron('0 6 22 * *')).toContain('22nd');
    expect(describeCron('*/5 * * * *')).toBe('Every 5 minutes');
    expect(describeCron('5 4 * * 1,3')).toBe('At 04:05, on day-of-week 1,3');
    expect(describeCron('bad')).toBe('Invalid schedule');
  });
});

describe('time zones', () => {
  it('validates zone names and always offers UTC', () => {
    expect(isValidTimeZone('Europe/Helsinki')).toBe(true);
    expect(isValidTimeZone('Nowhere/City')).toBe(false);
    expect(getTimeZones()).toContain('UTC');
  });
});
