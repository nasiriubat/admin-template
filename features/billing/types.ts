export type PlanId = 'starter' | 'growth' | 'scale';
export type InvoiceStatus = 'paid' | 'open' | 'failed';
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover';

export interface Plan {
  id: PlanId;
  name: string;
  /** Monthly price in cents. */
  priceCents: number;
  seats: number;
  apiRequests: number;
  storageGb: number;
  features: string[];
}

/** Brand, last four digits and expiry only. The full card number is never held by this app. */
export interface PaymentMethod {
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface Meter {
  used: number;
  limit: number;
}

export interface Subscription {
  planId: PlanId;
  planName: string;
  priceCents: number;
  renewsAt: string;
  status: 'active' | 'canceling';
  seats: Meter;
  apiRequests: Meter;
  storageGb: Meter;
  paymentMethod: PaymentMethod;
}

export interface Invoice {
  id: string;
  number: string;
  issuedAt: string;
  amountCents: number;
  status: InvoiceStatus;
  description: string;
}

export const CARD_BRANDS: ReadonlyArray<{ value: CardBrand; label: string }> = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'amex', label: 'American Express' },
  { value: 'discover', label: 'Discover' },
];

export const brandLabel = (brand: CardBrand) => CARD_BRANDS.find((b) => b.value === brand)?.label ?? brand;
