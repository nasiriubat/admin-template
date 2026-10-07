import type { ListQuery } from '@nexus/api-client';
import { api } from '../_shared/api';
import type { Invoice, Plan, PlanId, Subscription } from './types';

export const billingService = {
  subscription: (signal?: AbortSignal) => api.get<Subscription>('/billing/subscription', { signal }),
  plans: (signal?: AbortSignal) => api.get<Plan[]>('/billing/plans', { signal }),
  invoices: (query: ListQuery, signal?: AbortSignal) => api.list<Invoice>('/billing/invoices', query, { signal }),
  changePlan: (planId: PlanId) => api.post<Subscription>('/billing/plan', { planId }),
  updatePaymentMethod: (input: { brand: string; last4: string; expMonth: number; expYear: number }) => api.put<Subscription>('/billing/payment-method', input),
  cancel: () => api.post<Subscription>('/billing/cancel'),
};
