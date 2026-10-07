export interface ParsedStat {
  prefix: string;
  value: number;
  suffix: string;
  decimals: number;
}

/**
 * Splits a display stat such as "99.9%", "$1,200" or "14" into a countable number plus its
 * surrounding text. Returns null when there is no leading number to animate (e.g. "AA", "24/7" is
 * counted as 24 with suffix "/7").
 */
export function parseStat(raw: string): ParsedStat | null {
  const m = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(raw.trim());
  if (!m) return null;
  const [, prefix = '', num = '', suffix = ''] = m;
  const value = Number(num.replace(/,/g, ''));
  if (!Number.isFinite(value)) return null;
  // Text-led values like "SOC 2" or "WCAG 2.2" read better static than counted.
  if (/[A-Za-z]/.test(prefix)) return null;
  const decimals = num.includes('.') ? (num.split('.')[1]?.length ?? 0) : 0;
  return { prefix, value, suffix, decimals };
}
