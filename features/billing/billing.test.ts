import { describe, expect, it } from 'vitest';
import { formatMoney, invoiceText, parseExpiry, paymentMethodSchema } from './schemas';

describe('billing schemas', () => {
  it('parses MM/YY expiry', () => {
    expect(parseExpiry('08/29')).toEqual({ month: 8, year: 2029 });
    expect(parseExpiry('13/29')).toBeNull();
    expect(parseExpiry('8/2029')).toBeNull();
  });

  it('accepts brand, last4 and a future expiry', () => {
    expect(paymentMethodSchema.safeParse({ brand: 'visa', last4: '4242', expiry: '12/99' }).success).toBe(true);
  });

  it('rejects full card numbers, expired cards and unknown brands', () => {
    expect(paymentMethodSchema.safeParse({ brand: 'visa', last4: '4242424242424242', expiry: '12/99' }).success).toBe(false);
    expect(paymentMethodSchema.safeParse({ brand: 'visa', last4: '4242', expiry: '01/20' }).success).toBe(false);
    expect(paymentMethodSchema.safeParse({ brand: 'jcb', last4: '4242', expiry: '12/99' }).success).toBe(false);
  });

  it('formats money and invoice text', () => {
    expect(formatMoney(9900)).toBe('$99.00');
    const text = invoiceText({ id: 'x', number: 'INV-1', issuedAt: '2026-01-02T00:00:00Z', amountCents: 9900, status: 'paid', description: 'Plan' });
    expect(text).toContain('Invoice INV-1');
    expect(text).toContain('$99.00');
  });
});
