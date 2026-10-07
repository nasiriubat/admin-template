'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListQuery } from '@nexus/api-client';
import { billingService } from './service';

export const billingKeys = {
  all: ['billing'] as const,
  subscription: ['billing', 'subscription'] as const,
  plans: ['billing', 'plans'] as const,
  invoices: (query: ListQuery) => ['billing', 'invoices', query] as const,
};

export const useSubscription = () => useQuery({ queryKey: billingKeys.subscription, queryFn: ({ signal }) => billingService.subscription(signal) });
export const usePlans = () => useQuery({ queryKey: billingKeys.plans, queryFn: ({ signal }) => billingService.plans(signal) });
export const useInvoices = (query: ListQuery) =>
  useQuery({ queryKey: billingKeys.invoices(query), queryFn: ({ signal }) => billingService.invoices(query, signal), placeholderData: keepPreviousData });

function useInvalidatingMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.all }) });
}

export const useChangePlan = () => useInvalidatingMutation(billingService.changePlan);
export const useUpdatePaymentMethod = () => useInvalidatingMutation(billingService.updatePaymentMethod);
export const useCancelSubscription = () => useInvalidatingMutation(() => billingService.cancel());
