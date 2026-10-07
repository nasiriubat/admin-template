export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-US', options).format(value);
}

export function formatCompact(value: number): string {
  return formatNumber(value, { notation: 'compact', maximumFractionDigits: 1 });
}

export function formatDate(value: string | number | Date, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function formatDateTime(value: string | number | Date): string {
  return formatDate(value, { dateStyle: 'medium', timeStyle: 'short' });
}

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

export function formatRelative(value: string | number | Date, now: number = Date.now()): string {
  const time = (value instanceof Date ? value : new Date(value)).getTime();
  if (Number.isNaN(time)) return '';
  const seconds = Math.round((time - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return Math.abs(seconds) < 30 ? 'just now' : rtf.format(Math.round(seconds / 60), 'minute');
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
}
