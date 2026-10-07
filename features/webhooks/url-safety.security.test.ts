import { describe, expect, it } from 'vitest';
import { validateWebhookUrl } from './url-safety';

describe('webhook URL SSRF hygiene (IPv6)', () => {
  it.each([
    'https://[::1]/hook',
    'https://[::127.0.0.1]/hook', // normalises to [::7f00:1]
    'https://[::ffff:7f00:1]/hook',
    'https://[64:ff9b::7f00:1]/hook', // NAT64
    'https://[2002:7f00:1::]/hook', // 6to4 embedding 127.0.0.1
    'https://[fe80::1]/hook',
    'https://[fd00::1]/hook',
    'https://[2001:db8::1]/hook',
  ])('rejects %s', (url) => {
    expect(validateWebhookUrl(url)).not.toBeNull();
  });
  it('accepts a normal https host and global unicast IPv6', () => {
    expect(validateWebhookUrl('https://hooks.example.com/in')).toBeNull();
    expect(validateWebhookUrl('https://[2606:4700:4700::1111]/in')).toBeNull();
  });
});
