/**
 * Client-side SSRF hygiene for webhook targets. This only gives fast feedback: the server must
 * enforce the same rules (and re-resolve DNS) before it ever delivers to a URL.
 */

const BLOCKED_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home', '.corp', '.intranet'];

function parseIPv4(host: string): number[] | null {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!match) return null;
  const parts = match.slice(1).map(Number);
  return parts.every((n) => n >= 0 && n <= 255) ? parts : null;
}

export function isPrivateIPv4([a, b]: number[]): boolean {
  return (
    a === 0 || // "this" network
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local, incl. cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224 // multicast and reserved
  );
}

function isPrivateIPv6(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, '');
  // Allowlist, not blocklist: only global unicast space (2000::/3) is accepted, minus ranges that
  // embed or tunnel other addresses (6to4 2002::/16, Teredo 2001::/32) and documentation 2001:db8::/32.
  // Loopback, unspecified, IPv4-mapped/compatible, NAT64, link-local and unique-local all fall outside it.
  if (!/^[23]/.test(h)) return true;
  if (/^2002:/.test(h) || /^2001:(0{0,3}:|0{1,4}:|db8:|0db8:)/.test(h)) return true;
  return false;
}

/** Returns a user-facing error message, or null when the URL is acceptable. */
export function validateWebhookUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return 'Enter a valid URL, for example https://example.com/webhooks.';
  }
  if (url.protocol !== 'https:') return 'Only https:// URLs are allowed.';
  if (url.username || url.password) return 'URLs with embedded credentials are not allowed.';

  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (host.startsWith('[') && host.endsWith(']')) {
    return isPrivateIPv6(host.slice(1, -1)) ? 'Private or loopback addresses are not allowed.' : null;
  }
  if (host === 'localhost' || BLOCKED_SUFFIXES.some((s) => host.endsWith(s))) return 'Local and internal hostnames are not allowed.';
  const v4 = parseIPv4(host);
  if (v4) return isPrivateIPv4(v4) ? 'Private or loopback addresses are not allowed.' : null;
  if (!host.includes('.')) return 'Use a fully qualified domain name.';
  return null;
}
