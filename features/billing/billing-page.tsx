'use client';

import { useState } from 'react';
import { useCan } from '@nexus/auth';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  formatDate,
  PageContainer,
  PageHeader,
  QueryBoundary,
  Skeleton,
  toast,
} from '@nexus/ui';
import { useCancelSubscription, usePlans, useSubscription } from './hooks';
import { InvoicesTable } from './invoices-table';
import { PaymentMethodCard } from './payment-method-card';
import { PlanChangeDialog } from './plan-change-dialog';
import { formatMoney } from './schemas';
import { UsageMeter } from './usage-meter';
import type { Plan, Subscription } from './types';

function PlanComparison({ subscription, canManage, onSelect }: { subscription: Subscription; canManage: boolean; onSelect: (plan: Plan) => void }) {
  const plans = usePlans();
  return (
    <section aria-labelledby="compare-plans" className="space-y-3">
      <div>
        <h2 id="compare-plans" className="text-base font-semibold text-text">Compare plans</h2>
        <p className="text-sm text-text-muted">Changes apply immediately and are prorated.</p>
      </div>
      <QueryBoundary
          query={{ data: plans.data, isPending: plans.isPending, isError: plans.isError, error: plans.error, refetch: plans.refetch }}
          loading={<div className="grid grid-cols-1 gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-56 w-full" />)}</div>}
        >
          {(list) => (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {list.map((plan) => {
                const current = plan.id === subscription.planId;
                return (
                  <li key={plan.id}><Card className="flex h-full flex-col gap-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-text">{plan.name}</h3>
                      {current && <Badge variant="primary">Current</Badge>}
                    </div>
                    <p className="text-2xl font-semibold text-text">{formatMoney(plan.priceCents)}<span className="text-sm font-normal text-text-muted"> / month</span></p>
                    <ul className="mb-2 space-y-1 text-sm text-text-muted">
                      <li>{plan.seats} seats</li>
                      <li>{plan.apiRequests.toLocaleString()} API requests</li>
                      <li>{plan.storageGb.toLocaleString()} GB storage</li>
                      {plan.features.map((f) => <li key={f}>{f}</li>)}
                    </ul>
                    {canManage && (
                      <Button className="mt-auto" variant={current ? 'secondary' : 'primary'} disabled={current} aria-label={current ? `${plan.name} is your current plan` : `Switch to ${plan.name}`} onClick={() => onSelect(plan)}>
                        {current ? 'Current plan' : 'Switch plan'}
                      </Button>
                    )}
                  </Card></li>
                );
              })}
            </ul>
          )}
      </QueryBoundary>
    </section>
  );
}

function BillingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export function BillingPage() {
  const canManage = useCan('billing.manage');
  const subscription = useSubscription();
  const cancel = useCancelSubscription();
  const [target, setTarget] = useState<Plan | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  return (
    <PageContainer>
      <PageHeader title="Billing" description="Your plan, usage, invoices and payment method." />

      <QueryBoundary
        query={{ data: subscription.data, isPending: subscription.isPending, isError: subscription.isError, error: subscription.error, refetch: subscription.refetch }}
        loading={<BillingSkeleton />}
      >
        {(sub) => (
          <div className="space-y-4">
            {sub.status === 'canceling' && (
              <Alert variant="warning" title="Subscription ending">Your plan stays active until {formatDate(sub.renewsAt)}, then it will not renew.</Alert>
            )}

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Current plan</CardTitle>
                  <CardDescription>{sub.status === 'canceling' ? 'Ends' : 'Renews'} on {formatDate(sub.renewsAt)}</CardDescription>
                </div>
                <Badge variant={sub.status === 'active' ? 'success' : 'warning'} dot>{sub.status === 'active' ? 'Active' : 'Canceling'}</Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-3xl font-semibold text-text">
                  {sub.planName} <span className="text-base font-normal text-text-muted">{formatMoney(sub.priceCents)} / month</span>
                </p>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <UsageMeter label="Seats" used={sub.seats.used} limit={sub.seats.limit} />
                  <UsageMeter label="API requests" used={sub.apiRequests.used} limit={sub.apiRequests.limit} />
                  <UsageMeter label="Storage" used={sub.storageGb.used} limit={sub.storageGb.limit} unit=" GB" />
                </div>
              </CardContent>
            </Card>

            <PlanComparison subscription={sub} canManage={canManage} onSelect={setTarget} />
            <PaymentMethodCard method={sub.paymentMethod} canManage={canManage} />

            <section aria-labelledby="invoices-heading" className="space-y-3">
              <div>
                <h2 id="invoices-heading" className="text-base font-semibold text-text">Invoices</h2>
                <p className="text-sm text-text-muted">Download a copy of any past invoice.</p>
              </div>
              <InvoicesTable />
            </section>

            {canManage && sub.status === 'active' && (
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-text">Cancel subscription</h2>
                    <p className="text-sm text-text-muted">Your workspace stays available until the end of the current period.</p>
                  </div>
                  <Button variant="danger" onClick={() => setCancelOpen(true)}>Cancel subscription…</Button>
                </CardContent>
              </Card>
            )}

            <PlanChangeDialog plan={target} subscription={sub} onClose={() => setTarget(null)} />
            <ConfirmDialog
              open={cancelOpen}
              onOpenChange={setCancelOpen}
              title="Cancel your subscription?"
              description={`Your ${sub.planName} plan will not renew after ${formatDate(sub.renewsAt)}. Data beyond free-tier limits may be removed after that date.`}
              confirmLabel="Cancel subscription"
              requireText="CANCEL"
              onConfirm={async () => {
                await cancel.mutateAsync();
                toast.success('Subscription will end at the close of this period');
              }}
            />
          </div>
        )}
      </QueryBoundary>
    </PageContainer>
  );
}
