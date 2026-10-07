import { describe, expect, it } from 'vitest';
import { estimateCost, extractVariables, keyFingerprint, maskKey, parseTags, renderTemplate } from './ai-utils';
import { pricingSchema, promptFormSchema, providerFormSchema } from './schemas';

describe('extractVariables', () => {
  it('finds unique variables in order, tolerating spaces', () => {
    expect(extractVariables('Hi {{name}}, {{ issue }} and {{name}} again')).toEqual(['name', 'issue']);
  });
  it('ignores malformed placeholders', () => {
    expect(extractVariables('{{}} {{1abc}} {single} {{ok_1}}')).toEqual(['ok_1']);
  });
  it('returns an empty list when there are none', () => {
    expect(extractVariables('plain text')).toEqual([]);
  });
});

describe('renderTemplate', () => {
  it('substitutes provided values and keeps missing ones visible', () => {
    expect(renderTemplate('Hello {{name}}, re: {{issue}}', { name: 'Ada' })).toBe('Hello Ada, re: {{issue}}');
  });
  it('replaces every occurrence', () => {
    expect(renderTemplate('{{a}}-{{a}}', { a: 'x' })).toBe('x-x');
  });
});

describe('key helpers', () => {
  it('masks to prefix and last four only', () => {
    expect(maskKey('sk-pro', 'x7Qa')).toBe('sk-pro••••x7Qa');
    expect(maskKey(null, null)).toBe('No key');
  });
  it('fingerprints without keeping the middle of the key', () => {
    const f = keyFingerprint('sk-proj-ABCDEFGHIJKL1234');
    expect(f).toEqual({ keyPrefix: 'sk-pro', keyLast4: '1234' });
    expect(JSON.stringify(f)).not.toContain('ABCDEFGH');
  });
});

describe('misc helpers', () => {
  it('estimates cost per 1M tokens', () => {
    expect(estimateCost(1_000_000, 500_000, 2.5, 10)).toBeCloseTo(7.5);
  });
  it('normalises tags', () => {
    expect(parseTags(' Support, support , ,Sales')).toEqual(['support', 'sales']);
  });
});

describe('schemas', () => {
  it('requires https base URLs', () => {
    const schema = providerFormSchema('create');
    expect(schema.safeParse({ name: 'Acme', type: 'anthropic', baseUrl: 'http://api.example.com', apiKey: 'abcdefgh1234' }).success).toBe(false);
    expect(schema.safeParse({ name: 'Acme', type: 'anthropic', baseUrl: 'https://api.example.com', apiKey: 'abcdefgh1234' }).success).toBe(true);
  });
  it('requires a key on create (except local) but not on edit', () => {
    const input = { name: 'Acme', type: 'openai-compatible', baseUrl: 'https://api.example.com', apiKey: '' };
    expect(providerFormSchema('create').safeParse(input).success).toBe(false);
    expect(providerFormSchema('create').safeParse({ ...input, type: 'local' }).success).toBe(true);
    expect(providerFormSchema('edit').safeParse(input).success).toBe(true);
  });
  it('validates pricing and prompts', () => {
    expect(pricingSchema.safeParse({ inputPrice: '-1', outputPrice: '2' }).success).toBe(false);
    expect(pricingSchema.safeParse({ inputPrice: '0.5', outputPrice: '2' }).success).toBe(true);
    expect(promptFormSchema.safeParse({ name: 'Ok', description: '', tags: 'a,b', template: '', note: '' }).success).toBe(false);
  });
});
