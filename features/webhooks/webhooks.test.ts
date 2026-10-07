import { describe, expect, it } from 'vitest';
import { webhookFormSchema } from './schemas';
import { validateWebhookUrl } from './url-safety';
import { applyEnabled, deriveWebhookStatus, maskSecret, toggleItem } from './webhook-utils';
import type { Webhook } from './types';

describe('validateWebhookUrl', () => {
  it.each(['https://example.com/hook', 'https://api.acme.io:8443/a?b=1', 'https://8.8.8.8/x', 'https://[2001:4860:4860::8888]/x'])('accepts %s', (u) =>
    expect(validateWebhookUrl(u)).toBeNull(),
  );
  it.each([
    'http://example.com/hook',
    'ftp://example.com',
    'not a url',
    'https://localhost/hook',
    'https://app.localhost/hook',
    'https://127.0.0.1/hook',
    'https://10.1.2.3/hook',
    'https://172.16.0.1/hook',
    'https://172.31.255.255/hook',
    'https://192.168.1.10/hook',
    'https://169.254.169.254/latest/meta-data',
    'https://0.0.0.0/hook',
    'https://100.64.0.1/hook',
    'https://[::1]/hook',
    'https://[fd00::1]/hook',
    'https://[fe80::1]/hook',
    'https://[::ffff:127.0.0.1]/hook',
    'https://2130706433/hook',
    'https://printer.local/hook',
    'https://intranet/hook',
    'https://user:pass@example.com/hook',
  ])('rejects %s', (u) => expect(validateWebhookUrl(u)).not.toBeNull());
  it('does not block public addresses next to private ranges', () => {
    expect(validateWebhookUrl('https://172.32.0.1/x')).toBeNull();
    expect(validateWebhookUrl('https://100.128.0.1/x')).toBeNull();
  });
});

describe('webhookFormSchema', () => {
  const ok = { url: 'https://example.com/hook', description: '', events: ['user.created'] };
  it('accepts valid input', () => expect(webhookFormSchema.safeParse(ok).success).toBe(true));
  it('requires an event', () => expect(webhookFormSchema.safeParse({ ...ok, events: [] }).success).toBe(false));
  it('rejects unsafe URLs and unknown events', () => {
    expect(webhookFormSchema.safeParse({ ...ok, url: 'http://example.com' }).success).toBe(false);
    expect(webhookFormSchema.safeParse({ ...ok, url: 'https://localhost/x' }).success).toBe(false);
    expect(webhookFormSchema.safeParse({ ...ok, events: ['nope.event'] }).success).toBe(false);
  });
});

describe('webhook utils', () => {
  const w: Webhook = {
    id: '1', url: 'https://example.com', description: '', events: ['user.created'], enabled: true, status: 'enabled',
    lastDeliveryAt: '2026-01-01T00:00:00Z', successRate: 95, secretPrefix: 'whsec_', secretLast4: 'ab12', createdAt: '2026-01-01T00:00:00Z',
  };
  it('derives status', () => {
    expect(deriveWebhookStatus(w)).toBe('enabled');
    expect(deriveWebhookStatus({ ...w, successRate: 50 })).toBe('failing');
    expect(deriveWebhookStatus({ ...w, enabled: false, successRate: 50 })).toBe('disabled');
    expect(deriveWebhookStatus({ ...w, lastDeliveryAt: null, successRate: 0 })).toBe('enabled');
  });
  it('applies enabled optimistically', () => expect(applyEnabled(w, false).status).toBe('disabled'));
  it('masks the secret', () => expect(maskSecret(w)).toBe('whsec_••••ab12'));
  it('toggles items', () => expect(toggleItem(['a'], 'b', true)).toEqual(['a', 'b']));
});
