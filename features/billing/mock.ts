import { ApiError, createCollection } from '@nexus/api-client';
import { createRng, daysAgo } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import { paymentMethodSchema } from './schemas';
import type { Invoice, InvoiceStatus, Plan, PlanId, Subscription } from './types';

export const PLANS: Plan[] = [
  { id: 'starter', name: 'Starter', priceCents: 2900, seats: 5, apiRequests: 100_000, storageGb: 10, features: ['Email support', '30-day audit history', 'Community integrations'] },
  { id: 'growth', name: 'Growth', priceCents: 9900, seats: 25, apiRequests: 1_000_000, storageGb: 100, features: ['Priority support', '1-year audit history', 'Single sign-on', 'Webhooks'] },
  { id: 'scale', name: 'Scale', priceCents: 29900, seats: 100, apiRequests: 10_000_000, storageGb: 1000, features: ['Dedicated support', 'Unlimited audit history', 'Single sign-on and SCIM', 'Custom data residency'] },
];

const DAY = 86_400_000;

const subscription: Subscription = {
  planId: 'growth',
  planName: 'Growth',
  priceCents: 9900,
  renewsAt: new Date(Date.now() + 17 * DAY).toISOString(),
  status: 'active',
  seats: { used: 19, limit: 25 },
  apiRequests: { used: 842_300, limit: 1_000_000 },
  storageGb: { used: 63.4, limit: 100 },
  paymentMethod: { brand: 'visa', last4: '4242', expMonth: 12, expYear: 2029 },
};

const rng = createRng(20260909);
const invoiceSeed: Invoice[] = Array.from({ length: 14 }, (_, i) => {
  const status: InvoiceStatus = i === 0 ? 'open' : i === 5 ? 'failed' : 'paid';
  return {
    id: `inv-${String(14 - i).padStart(4, '0')}`,
    number: `INV-2026-${String(14 - i).padStart(4, '0')}`,
    issuedAt: daysAgo(13 + i * 30 + rng.int(0, 2)),
    amountCents: 9900 + (i % 4 === 3 ? 1500 : 0),
    status,
    description: i % 4 === 3 ? 'Growth plan plus 5 extra seats' : 'Growth plan, monthly',
  };
});
const invoices = createCollection<Invoice>(invoiceSeed, { searchFields: ['number', 'description'], filterFields: ['status'], defaultSort: { field: 'issuedAt', direction: 'desc' } });

mockRouter.on('GET', '/billing/subscription', () => ({ ...subscription }));
mockRouter.on('GET', '/billing/plans', () => PLANS);
mockRouter.on('GET', '/billing/invoices', ({ query }) => invoices.list(query));
mockRouter.on('POST', '/billing/plan', ({ body }) => {
  const { planId } = body as { planId: PlanId };
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) throw new ApiError('VALIDATION_ERROR', 'Unknown plan.', 422);
  if (subscription.seats.used > plan.seats) {
    throw new ApiError('CONFLICT', `This plan includes ${plan.seats} seats but ${subscription.seats.used} are in use. Remove members first.`, 409);
  }
  Object.assign(subscription, { planId, planName: plan.name, priceCents: plan.priceCents, status: 'active', seats: { ...subscription.seats, limit: plan.seats }, apiRequests: { ...subscription.apiRequests, limit: plan.apiRequests }, storageGb: { ...subscription.storageGb, limit: plan.storageGb } });
  return { ...subscription };
});
mockRouter.on('PUT', '/billing/payment-method', ({ body }) => {
  const input = body as { brand: string; last4: string; expMonth: number; expYear: number };
  const parsed = paymentMethodSchema.safeParse({ brand: input.brand, last4: input.last4, expiry: `${String(input.expMonth).padStart(2, '0')}/${String(input.expYear % 100).padStart(2, '0')}` });
  if (!parsed.success) throw new ApiError('VALIDATION_ERROR', 'Some of the information provided is not valid.', 422, { last4: 'Enter exactly the last 4 digits.' });
  subscription.paymentMethod = { brand: parsed.data.brand, last4: parsed.data.last4, expMonth: input.expMonth, expYear: input.expYear };
  return { ...subscription };
});
mockRouter.on('POST', '/billing/cancel', () => {
  subscription.status = 'canceling';
  return { ...subscription };
});
