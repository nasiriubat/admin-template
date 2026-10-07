import { z } from 'zod';
import type { Invoice } from './types';

export const formatMoney = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

/** Parses "MM/YY" into numeric parts, or null when malformed. */
export function parseExpiry(value: string): { month: number; year: number } | null {
  const m = /^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/.exec(value.trim());
  return m ? { month: Number(m[1]), year: 2000 + Number(m[2]) } : null;
}

/**
 * Demo-only payment method form. It collects brand, last four digits and expiry, never a full
 * card number or CVC. Real card entry must use the payment provider's hosted fields.
 */
export const paymentMethodSchema = z
  .object({
    brand: z.enum(['visa', 'mastercard', 'amex', 'discover'], { message: 'Choose a card brand.' }),
    last4: z.string().trim().regex(/^\d{4}$/, 'Enter exactly the last 4 digits.'),
    expiry: z.string().trim().min(1, 'Enter the expiry date.'),
  })
  .superRefine((value, ctx) => {
    const parsed = parseExpiry(value.expiry);
    if (!parsed) {
      ctx.addIssue({ code: 'custom', path: ['expiry'], message: 'Use the MM/YY format.' });
      return;
    }
    const now = new Date();
    if (parsed.year < now.getFullYear() || (parsed.year === now.getFullYear() && parsed.month < now.getMonth() + 1)) {
      ctx.addIssue({ code: 'custom', path: ['expiry'], message: 'This card has expired.' });
    }
  });

export type PaymentMethodInput = z.input<typeof paymentMethodSchema>;
export type PaymentMethodValues = z.output<typeof paymentMethodSchema>;

/** Plain-text invoice used for the demo download (a real backend would return a PDF). */
export function invoiceText(invoice: Invoice): string {
  return [
    `Invoice ${invoice.number}`,
    `Date: ${invoice.issuedAt.slice(0, 10)}`,
    `Description: ${invoice.description}`,
    `Amount: ${formatMoney(invoice.amountCents)}`,
    `Status: ${invoice.status}`,
    '',
  ].join('\r\n');
}

export function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
