'use client';

import { useEffect } from 'react';
import { useFieldArray, type FieldValues } from 'react-hook-form';
import type { z } from '../_shared/zod';
import { Button, FormField, IconRenderer, Input, Select, Textarea, useZodForm } from '@nexus/ui';
import { FIELD_SPECS, type FieldSpec } from './field-specs';
import { extractVariables } from './graph';
import { configSchemas } from './schemas';
import { SECRET_MASK, type NodeKind } from './types';

export interface ModelOption {
  modelId: string;
  displayName: string;
  providerName: string;
}

interface Props {
  kind: NodeKind;
  config: Record<string, unknown>;
  models: ModelOption[];
  readOnly: boolean;
  /** Called with the raw form values on every edit, valid or not, so validation reflects what is on screen. */
  onChange: (config: Record<string, unknown>) => void;
}

type Errors = Record<string, { message?: string } | undefined>;

function HeadersField({ form, readOnly }: { form: ReturnType<typeof useZodForm>; readOnly: boolean }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'headers' as never });
  const errors = (form.formState.errors as unknown as { headers?: Array<{ name?: { message?: string } } | undefined> }).headers;
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-text">Headers</legend>
      <p className="text-xs text-text-muted">Values are write-only. Once saved they show as dots and can only be replaced.</p>
      {fields.map((field, i) => (
        <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-start gap-2">
          <FormField label={`Header ${i + 1} name`} error={errors?.[i]?.name?.message}>
            <Input autoComplete="off" disabled={readOnly} placeholder="Authorization" {...form.register(`headers.${i}.name` as never)} />
          </FormField>
          <FormField label={`Header ${i + 1} value`}>
            <Input type="password" autoComplete="new-password" disabled={readOnly} onFocus={(e) => e.currentTarget.select()} placeholder={SECRET_MASK} {...form.register(`headers.${i}.value` as never)} />
          </FormField>
          <Button variant="ghost" size="icon" className="mt-6" disabled={readOnly} aria-label={`Remove header ${i + 1}`} onClick={() => remove(i)}><IconRenderer name="Trash2" className="size-4" /></Button>
        </div>
      ))}
      <Button variant="secondary" size="sm" disabled={readOnly || fields.length >= 20} onClick={() => append({ name: '', value: '' } as never)}><IconRenderer name="Plus" className="size-4" /> Add header</Button>
    </fieldset>
  );
}

function Field({ spec, form, models, readOnly, values }: { spec: FieldSpec; form: ReturnType<typeof useZodForm>; models: ModelOption[]; readOnly: boolean; values: Record<string, unknown> }) {
  const error = (form.formState.errors as Errors)[spec.name]?.message;
  const reg = form.register(spec.name as never, spec.kind === 'number' ? { valueAsNumber: true } : undefined);
  let hint: string | undefined = spec.hint;
  if (spec.name === 'promptTemplate') {
    const vars = extractVariables(String(values.promptTemplate ?? ''));
    hint = `${spec.hint} ${vars.length ? `Variables used: ${vars.join(', ')}.` : 'No variables used yet.'}`;
  }
  const mono = spec.mono ? 'font-mono text-xs' : undefined;
  return (
    <FormField label={spec.label} error={error} hint={hint}>
      {spec.kind === 'textarea' ? (
        <Textarea rows={spec.rows} disabled={readOnly} className={mono} {...reg} />
      ) : spec.kind === 'number' ? (
        <Input type="number" inputMode="decimal" step={spec.step} disabled={readOnly} {...reg} />
      ) : spec.kind === 'select' || spec.kind === 'models' ? (
        <Select disabled={readOnly} {...reg}>
          {spec.kind === 'models' ? (
            <>
              <option value="">Select a model</option>
              {values.modelId && !models.some((m) => m.modelId === values.modelId) && <option value={String(values.modelId)}>{String(values.modelId)} (not available)</option>}
              {models.map((m) => <option key={m.modelId} value={m.modelId}>{m.providerName} · {m.displayName}</option>)}
            </>
          ) : (
            spec.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)
          )}
        </Select>
      ) : (
        <Input autoComplete="off" disabled={readOnly} placeholder={spec.placeholder} className={mono} {...reg} />
      )}
    </FormField>
  );
}

/** Config editor for one node, generated from FIELD_SPECS and validated with that kind's Zod schema. */
export function NodeForm({ kind, config, models, readOnly, onChange }: Props) {
  const schema = configSchemas[kind] as unknown as z.ZodType<FieldValues, FieldValues>;
  const form = useZodForm(schema, { defaultValues: config as never, mode: 'onChange' });
  const values = form.watch() as Record<string, unknown>;

  useEffect(() => {
    void form.trigger();
    const sub = form.watch((v) => onChange(structuredClone(v) as Record<string, unknown>));
    return () => sub.unsubscribe();
  }, [form, onChange]);

  return (
    <form className="space-y-4" noValidate onSubmit={(e) => e.preventDefault()} aria-label={`${kind} settings`}>
      {FIELD_SPECS[kind].filter((s) => !s.showIf || s.showIf(values)).map((spec) =>
        spec.kind === 'headers' ? <HeadersField key={spec.name} form={form} readOnly={readOnly} /> : <Field key={spec.name} spec={spec} form={form} models={models} readOnly={readOnly} values={values} />,
      )}
    </form>
  );
}
