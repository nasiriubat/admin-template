'use client';

import { useState } from 'react';
import { Alert, Button, Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, toast } from '@nexus/ui';
import { useChangePlan } from './hooks';
import { formatMoney } from './schemas';
import type { Plan, Subscription } from './types';

const DAY = 86_400_000;

/** Confirms a plan change and explains proration before anything is submitted. */
export function PlanChangeDialog({ plan, subscription, onClose }: { plan: Plan | null; subscription: Subscription; onClose: () => void }) {
  const change = useChangePlan();
  const [error, setError] = useState<string | null>(null);
  const daysLeft = Math.max(1, Math.ceil((new Date(subscription.renewsAt).getTime() - Date.now()) / DAY));
  const diff = plan ? plan.priceCents - subscription.priceCents : 0;
  const prorated = Math.round((Math.abs(diff) * Math.min(daysLeft, 30)) / 30);

  async function confirm() {
    if (!plan) return;
    setError(null);
    try {
      await change.mutateAsync(plan.id);
      toast.success(`Switched to ${plan.name}`);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not change plan.');
    }
  }

  return (
    <Dialog open={Boolean(plan)} onOpenChange={(open) => { if (!open) { setError(null); onClose(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Switch to {plan?.name}?</DialogTitle>
          <DialogDescription>
            {plan ? `${formatMoney(plan.priceCents)} per month, replacing ${subscription.planName} at ${formatMoney(subscription.priceCents)}.` : ''}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3 py-3">
          {error && <Alert variant="danger">{error}</Alert>}
          <Alert variant="info" title="Prorated billing">
            The change takes effect immediately. For the {daysLeft} days left in this period you will be {diff >= 0 ? 'charged' : 'credited'} about {formatMoney(prorated)}, then billed {plan ? formatMoney(plan.priceCents) : ''} each month from the next renewal.
          </Alert>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={change.isPending}>Cancel</Button>
          <Button onClick={() => void confirm()} loading={change.isPending}>Confirm change</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
