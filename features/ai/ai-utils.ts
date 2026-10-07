const VARIABLE = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g;

/** Unique `{{variable}}` names in order of first appearance. */
export function extractVariables(template: string): string[] {
  const seen = new Set<string>();
  for (const match of template.matchAll(VARIABLE)) seen.add(match[1]);
  return [...seen];
}

/** Fill `{{variable}}` placeholders. Variables with no (or an empty) value stay visible as `{{name}}`. */
export function renderTemplate(template: string, values: Record<string, string>): string {
  return template.replace(VARIABLE, (whole, name: string) => (values[name] ? values[name] : whole));
}

/** Display form of a stored key: prefix and last four only. */
export function maskKey(prefix: string | null, last4: string | null): string {
  return prefix && last4 ? `${prefix}••••${last4}` : 'No key';
}

/** Build the stored prefix/last4 from a freshly submitted key (the key itself is never stored). */
export function keyFingerprint(key: string): { keyPrefix: string; keyLast4: string } {
  const trimmed = key.trim();
  return { keyPrefix: trimmed.slice(0, Math.min(6, Math.max(trimmed.length - 4, 0))), keyLast4: trimmed.slice(-4) };
}

export const estimateCost = (tokensIn: number, tokensOut: number, inputPrice: number, outputPrice: number) =>
  (tokensIn * inputPrice + tokensOut * outputPrice) / 1_000_000;

export const formatUsd = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: value < 100 ? 2 : 0, maximumFractionDigits: 2 }).format(value);

export const formatContext = (tokens: number) => (tokens >= 1_000_000 ? `${tokens / 1_000_000}M` : `${Math.round(tokens / 1000)}K`);

export const rangeDays = (range: '7d' | '30d' | '90d') => (range === '7d' ? 7 : range === '30d' ? 30 : 90);

export const parseTags = (raw: string) =>
  [...new Set(raw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))];
