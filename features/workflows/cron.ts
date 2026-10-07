/**
 * Dependency-free 5-field cron support: `minute hour day-of-month month day-of-week`.
 * Supports `*`, lists (`1,15`), ranges (`1-5`), steps (`10-50/10`, `5/10`, or a star followed by a slash and a number) and the
 * month/weekday names (`JAN`, `MON`). Weekday 7 is accepted as Sunday.
 *
 * Time zones: matching happens on the wall clock of the chosen zone. A wall time that does not
 * exist (spring-forward gap) is skipped; an ambiguous one (fall-back) fires once, at the first
 * occurrence. Day-of-month and day-of-week follow Vixie cron: when both are restricted a day
 * matches if EITHER does.
 */

interface FieldSpec {
  name: string;
  min: number;
  max: number;
  names?: readonly string[];
  nameOffset?: number;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const;
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

const FIELDS: FieldSpec[] = [
  { name: 'minute', min: 0, max: 59 },
  { name: 'hour', min: 0, max: 23 },
  { name: 'day of month', min: 1, max: 31 },
  { name: 'month', min: 1, max: 12, names: MONTHS, nameOffset: 1 },
  { name: 'day of week', min: 0, max: 7, names: WEEKDAYS, nameOffset: 0 },
];

export interface ParsedCron {
  minutes: number[];
  hours: number[];
  daysOfMonth: number[];
  months: number[];
  daysOfWeek: number[];
  domRestricted: boolean;
  dowRestricted: boolean;
}

export type CronParseResult = { ok: true; cron: ParsedCron } | { ok: false; error: string };

function parseValue(raw: string, spec: FieldSpec): number | string {
  if (/^\d+$/.test(raw)) return Number(raw);
  const index = spec.names?.indexOf(raw.toUpperCase()) ?? -1;
  if (index === -1) return `Unknown value "${raw}" in the ${spec.name} field.`;
  return index + (spec.nameOffset ?? 0);
}

function parseField(source: string, spec: FieldSpec): number[] | string {
  const values = new Set<number>();
  for (const part of source.split(',')) {
    if (!part) return `Empty list item in the ${spec.name} field.`;
    const [rangePart, stepPart, extra] = part.split('/');
    if (extra !== undefined) return `Too many "/" in the ${spec.name} field.`;
    let step = 1;
    if (stepPart !== undefined) {
      if (!/^\d+$/.test(stepPart) || Number(stepPart) < 1) return `Step "${stepPart}" in the ${spec.name} field must be a positive number.`;
      step = Number(stepPart);
    }
    let start: number;
    let end: number;
    if (rangePart === '*') {
      start = spec.min;
      end = spec.name === 'day of week' ? 6 : spec.max;
    } else if (rangePart.includes('-')) {
      const [a, b, more] = rangePart.split('-');
      if (more !== undefined) return `Invalid range "${rangePart}" in the ${spec.name} field.`;
      const from = parseValue(a, spec);
      const to = parseValue(b, spec);
      if (typeof from === 'string') return from;
      if (typeof to === 'string') return to;
      start = from;
      end = to;
    } else {
      const single = parseValue(rangePart, spec);
      if (typeof single === 'string') return single;
      start = single;
      end = stepPart !== undefined ? (spec.name === 'day of week' ? 6 : spec.max) : single;
    }
    if (start < spec.min || end > spec.max) return `Value out of range in the ${spec.name} field (${spec.min}-${spec.max}).`;
    if (start > end) return `Range "${rangePart}" in the ${spec.name} field runs backwards.`;
    for (let v = start; v <= end; v += step) values.add(spec.name === 'day of week' && v === 7 ? 0 : v);
  }
  return [...values].sort((a, b) => a - b);
}

export function parseCron(expression: string): CronParseResult {
  const parts = expression.trim().split(/\s+/).filter(Boolean);
  if (parts.length !== 5) return { ok: false, error: `Use 5 fields (minute hour day-of-month month day-of-week); found ${parts.length}.` };
  const parsed: number[][] = [];
  for (let i = 0; i < 5; i += 1) {
    const result = parseField(parts[i], FIELDS[i]);
    if (typeof result === 'string') return { ok: false, error: result };
    parsed.push(result);
  }
  return {
    ok: true,
    cron: {
      minutes: parsed[0],
      hours: parsed[1],
      daysOfMonth: parsed[2],
      months: parsed[3],
      daysOfWeek: parsed[4],
      domRestricted: !parts[2].startsWith('*'),
      dowRestricted: !parts[4].startsWith('*'),
    },
  };
}

/** Returns an error message or null when the expression is valid. */
export function validateCron(expression: string): string | null {
  const result = parseCron(expression);
  return result.ok ? null : result.error;
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

const FALLBACK_ZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo', 'Europe/London', 'Europe/Berlin', 'Europe/Helsinki', 'Africa/Johannesburg', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland'];

export function getTimeZones(): string[] {
  const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
  let zones: string[] = [];
  try {
    zones = intl.supportedValuesOf?.('timeZone') ?? [];
  } catch {
    zones = [];
  }
  const list = zones.length ? zones : FALLBACK_ZONES;
  return list.includes('UTC') ? list : ['UTC', ...list];
}

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();
function wallClock(instant: number, tz: string): WallClock {
  let fmt = formatters.get(tz);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
    formatters.set(tz, fmt);
  }
  const get = Object.fromEntries(fmt.formatToParts(new Date(instant)).map((p) => [p.type, Number(p.value)]));
  return { year: get.year, month: get.month, day: get.day, hour: get.hour % 24, minute: get.minute };
}

const asUtc = (w: WallClock) => Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute);

/** Convert a wall-clock time in `tz` to an instant, or null when that time does not exist (DST gap). */
export function zonedTimeToInstant(w: WallClock, tz: string): number | null {
  const guess = asUtc(w);
  // Try the offsets in effect a day before and after: handles both sides of a transition.
  const candidates = new Set<number>();
  for (const probe of [guess - 86_400_000, guess, guess + 86_400_000]) {
    const offset = asUtc(wallClock(probe, tz)) - probe;
    candidates.add(guess - offset);
  }
  const valid = [...candidates].filter((instant) => asUtc(wallClock(instant, tz)) === guess).sort((a, b) => a - b);
  return valid.length ? valid[0] : null;
}

function dayMatches(c: ParsedCron, year: number, month: number, day: number): boolean {
  if (!c.months.includes(month)) return false;
  const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const domOk = c.daysOfMonth.includes(day);
  const dowOk = c.daysOfWeek.includes(dow);
  if (c.domRestricted && c.dowRestricted) return domOk || dowOk;
  if (c.domRestricted) return domOk;
  if (c.dowRestricted) return dowOk;
  return true;
}

/** The next `count` fire times strictly after `from`, in ascending order. Empty for invalid input. */
export function nextRuns(expression: string, tz: string, count: number, from: Date = new Date()): Date[] {
  const parsed = parseCron(expression);
  if (!parsed.ok || !isValidTimeZone(tz) || count < 1) return [];
  const c = parsed.cron;
  const results: number[] = [];
  const start = wallClock(from.getTime(), tz);
  const cursor = new Date(Date.UTC(start.year, start.month - 1, start.day));
  const MAX_DAYS = 366 * 8;
  for (let i = 0; i < MAX_DAYS && results.length < count; i += 1, cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth() + 1;
    const day = cursor.getUTCDate();
    if (!dayMatches(c, year, month, day)) continue;
    const found: number[] = [];
    for (const hour of c.hours) {
      for (const minute of c.minutes) {
        const instant = zonedTimeToInstant({ year, month, day, hour, minute }, tz);
        if (instant !== null && instant > from.getTime()) found.push(instant);
      }
    }
    found.sort((a, b) => a - b);
    for (const instant of found) if (!results.includes(instant) && results.length < count) results.push(instant);
  }
  return results.map((t) => new Date(t));
}

/* ------------------------------------------------------------------ presets --- */

export type PresetKind = 'every-15' | 'hourly' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom';

export interface PresetOptions {
  time: string;
  weekday: number;
  dayOfMonth: number;
}

export const DEFAULT_PRESET_OPTIONS: PresetOptions = { time: '09:00', weekday: 1, dayOfMonth: 1 };

export const PRESET_LABELS: ReadonlyArray<{ value: PresetKind; label: string }> = [
  { value: 'every-15', label: 'Every 15 minutes' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily at a set time' },
  { value: 'weekdays', label: 'Weekdays at a set time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom cron expression' },
];

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const splitTime = (time: string): [number, number] => {
  const [h, m] = time.split(':').map(Number);
  return [Number.isFinite(h) ? h : 9, Number.isFinite(m) ? m : 0];
};
const pad = (n: number) => String(n).padStart(2, '0');

export function buildPreset(kind: Exclude<PresetKind, 'custom'>, options: PresetOptions = DEFAULT_PRESET_OPTIONS): string {
  const [h, m] = splitTime(options.time);
  switch (kind) {
    case 'every-15': return '*/15 * * * *';
    case 'hourly': return '0 * * * *';
    case 'daily': return `${m} ${h} * * *`;
    case 'weekdays': return `${m} ${h} * * 1-5`;
    case 'weekly': return `${m} ${h} * * ${options.weekday}`;
    case 'monthly': return `${m} ${h} ${options.dayOfMonth} * *`;
  }
}

/** Map an expression back onto a preset (and its options) so the editor can prefill. */
export function detectPreset(expression: string): { kind: PresetKind; options: PresetOptions } {
  const e = expression.trim().replace(/\s+/g, ' ');
  const base = { ...DEFAULT_PRESET_OPTIONS };
  if (e === '*/15 * * * *') return { kind: 'every-15', options: base };
  if (e === '0 * * * *') return { kind: 'hourly', options: base };
  const m = /^(\d{1,2}) (\d{1,2}) (\*|\d{1,2}) \* (\*|1-5|[0-6])$/.exec(e);
  if (m) {
    const [, min, hour, dom, dow] = m;
    const time = `${pad(Number(hour))}:${pad(Number(min))}`;
    if (Number(hour) < 24 && Number(min) < 60) {
      if (dom === '*' && dow === '*') return { kind: 'daily', options: { ...base, time } };
      if (dom === '*' && dow === '1-5') return { kind: 'weekdays', options: { ...base, time } };
      if (dom === '*') return { kind: 'weekly', options: { ...base, time, weekday: Number(dow) } };
      if (dow === '*' && Number(dom) >= 1 && Number(dom) <= 31) return { kind: 'monthly', options: { ...base, time, dayOfMonth: Number(dom) } };
    }
  }
  return { kind: 'custom', options: base };
}

/* -------------------------------------------------------------- description --- */

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

/** Plain-English description such as "Every weekday at 09:00". Falls back to the raw fields. */
export function describeCron(expression: string): string {
  const parsed = parseCron(expression);
  if (!parsed.ok) return 'Invalid schedule';
  const { kind, options } = detectPreset(expression);
  const at = options.time;
  switch (kind) {
    case 'every-15': return 'Every 15 minutes';
    case 'hourly': return 'Every hour, on the hour';
    case 'daily': return `Every day at ${at}`;
    case 'weekdays': return `Every weekday at ${at}`;
    case 'weekly': return `Every ${WEEKDAY_NAMES[options.weekday]} at ${at}`;
    case 'monthly': return `On the ${ordinal(options.dayOfMonth)} of every month at ${at}`;
    default: break;
  }
  const [min, hour, dom, mon, dow] = expression.trim().split(/\s+/);
  const step = /^\*\/(\d+)$/.exec(min);
  const parts: string[] = [];
  if (step && hour === '*') parts.push(`Every ${step[1]} minutes`);
  else if (/^\d+$/.test(min) && /^\d+$/.test(hour)) parts.push(`At ${pad(Number(hour))}:${pad(Number(min))}`);
  else parts.push(`At minute ${min}, hour ${hour}`);
  if (dom !== '*') parts.push(`on day-of-month ${dom}`);
  if (mon !== '*') parts.push(`in month ${mon}`);
  if (dow !== '*') parts.push(`on day-of-week ${dow}`);
  return parts.join(', ');
}
