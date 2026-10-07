'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  IconRenderer,
  Input,
  Select,
  toast,
  useZodForm,
} from '@nexus/ui';
import { useUpdatePaymentMethod } from './hooks';
import { paymentMethodSchema, parseExpiry, type PaymentMethodInput } from './schemas';
import { brandLabel, CARD_BRANDS, type PaymentMethod } from './types';

const EMPTY: PaymentMethodInput = { brand: 'visa', last4: '', expiry: '' };

function PaymentMethodDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const update = useUpdatePaymentMethod();
  const form = useZodForm(paymentMethodSchema, { defaultValues: EMPTY });
  const { register, handleSubmit, reset, formState } = form;
  const { errors, isSubmitting } = formState;

  useEffect(() => {
    if (open) reset(EMPTY);
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const exp = parseExpiry(values.expiry);
    if (!exp) return;
    try {
      await update.mutateAsync({ brand: values.brand, last4: values.last4, expMonth: exp.month, expYear: exp.year });
      toast.success('Payment method updated', { description: `${brandLabel(values.brand)} ending in ${values.last4}` });
      onOpenChange(false);
    } catch (e) {
      toast.error('Could not update payment method', { description: e instanceof Error ? e.message : undefined });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>Update payment method</DialogTitle>
            <DialogDescription>Demo form: it only records the card brand, last 4 digits and expiry.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 py-3">
            <Alert variant="warning" title="Never enter a full card number here">
              In a real deployment, card entry must use the payment provider’s hosted fields so card data never touches this app.
            </Alert>
            <FormField label="Card brand" required error={errors.brand?.message}>
              <Select {...register('brand')}>
                {CARD_BRANDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </Select>
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Last 4 digits" required error={errors.last4?.message}>
                <Input inputMode="numeric" maxLength={4} autoComplete="off" {...register('last4')} />
              </FormField>
              <FormField label="Expiry (MM/YY)" required error={errors.expiry?.message}>
                <Input placeholder="08/29" maxLength={5} autoComplete="off" {...register('expiry')} />
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Save payment method</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentMethodCard({ method, canManage }: { method: PaymentMethod; canManage: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Payment method</CardTitle>
          <CardDescription>Used for renewals and invoices.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <span className="grid size-10 place-items-center rounded-input bg-canvas text-text-muted"><IconRenderer name="CreditCard" className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text">{brandLabel(method.brand)} ending in {method.last4}</p>
          <p className="text-xs text-text-muted">Expires {String(method.expMonth).padStart(2, '0')}/{String(method.expYear).slice(-2)}</p>
        </div>
        {canManage && <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>Update</Button>}
      </CardContent>
      <PaymentMethodDialog open={open} onOpenChange={setOpen} />
    </Card>
  );
}
