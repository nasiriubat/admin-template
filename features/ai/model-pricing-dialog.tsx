'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  applyServerErrors,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  toast,
  useZodForm,
} from '@nexus/ui';
import { useSetModelPricing } from './hooks';
import { pricingSchema, type PricingInput } from './schemas';
import type { AiModel } from './types';

/** Edit the per-1M-token prices used for cost estimates. */
export function ModelPricingDialog({ model, onOpenChange }: { model: AiModel | null; onOpenChange: (open: boolean) => void }) {
  const update = useSetModelPricing();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(pricingSchema, { defaultValues: { inputPrice: 0, outputPrice: 0 } as PricingInput });
  const { register, handleSubmit, reset, formState } = form;
  const { errors, isSubmitting } = formState;

  useEffect(() => {
    if (model) {
      setFormError(null);
      reset({ inputPrice: model.inputPrice, outputPrice: model.outputPrice });
    }
  }, [model, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!model) return;
    setFormError(null);
    try {
      await update.mutateAsync({ id: model.id, input: values });
      toast.success('Pricing updated', { description: model.displayName });
      onOpenChange(false);
    } catch (error) {
      setFormError(applyServerErrors(form as never, error));
    }
  });

  return (
    <Dialog open={Boolean(model)} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>Edit pricing</DialogTitle>
            <DialogDescription>{model?.displayName}: prices in US dollars per 1M tokens, used for cost estimates.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 py-3">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Input price (per 1M tokens)" required error={errors.inputPrice?.message}>
                <Input type="number" inputMode="decimal" step="0.01" min="0" {...register('inputPrice')} />
              </FormField>
              <FormField label="Output price (per 1M tokens)" required error={errors.outputPrice?.message}>
                <Input type="number" inputMode="decimal" step="0.01" min="0" {...register('outputPrice')} />
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Save pricing</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
