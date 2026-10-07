'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Alert } from '../ui/alert';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input, Select, Textarea } from '../ui/input';
import { FormField } from '../forms/form-field';
import { useZodForm } from '../forms/use-zod-form';
import { buildMailto, consumeRateLimit, contactSchema, contactTopics, type ContactValues } from './contact-schema';

type Status = { kind: 'idle' } | { kind: 'sent'; via: 'endpoint' | 'mailto' } | { kind: 'error'; message: string };

const defaults: ContactValues = { name: '', email: '', company: '', topic: 'sales', message: '', consent: false, website: '' };

/**
 * Contact form. POSTs JSON to `endpoint` when provided, otherwise opens the visitor's mail client
 * addressed to `fallbackEmail`. No secrets are involved: the endpoint is a public URL.
 */
export function ContactForm({ endpoint, fallbackEmail }: { endpoint?: string; fallbackEmail: string }) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const form = useZodForm(contactSchema, { defaultValues: defaults });
  const { register, control, handleSubmit, reset, formState } = form;
  const { errors, isSubmitting } = formState;

  const onSubmit = handleSubmit(async (values) => {
    // Honeypot tripped: pretend success and send nothing.
    if (values.website) return setStatus({ kind: 'sent', via: 'endpoint' });
    let storage: Storage | null = null;
    try {
      storage = window.localStorage;
    } catch {
      storage = null;
    }
    const limit = consumeRateLimit(storage, Date.now());
    if (!limit.allowed) {
      return setStatus({ kind: 'error', message: `You have sent several messages recently. Please try again in about ${Math.ceil(limit.retryAfterMs / 60000)} minute(s).` });
    }
    const { website: _website, consent: _consent, ...payload } = values;
    if (!endpoint) {
      window.location.href = buildMailto(fallbackEmail, payload);
      setStatus({ kind: 'sent', via: 'mailto' });
      return;
    }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      reset(defaults);
      setStatus({ kind: 'sent', via: 'endpoint' });
    } catch {
      setStatus({ kind: 'error', message: `We could not send your message. Please try again, or email ${fallbackEmail} directly.` });
    }
  });

  if (status.kind === 'sent') {
    return (
      <Alert variant="success" title={status.via === 'mailto' ? 'Your email app should open' : 'Message sent'}>
        {status.via === 'mailto' ? `If nothing happened, write to ${fallbackEmail} instead.` : 'Thanks for reaching out. We reply within one business day.'}{' '}
        <button type="button" className="font-medium text-primary underline underline-offset-2" onClick={() => setStatus({ kind: 'idle' })}>
          Send another message
        </button>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Contact form" className="space-y-5 rounded-card border border-border bg-surface p-5 shadow-card md:p-8">
      {status.kind === 'error' && <Alert variant="danger" title="Message not sent">{status.message}</Alert>}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" required error={errors.name?.message}>
          <Input autoComplete="name" {...register('name')} />
        </FormField>
        <FormField label="Work email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" inputMode="email" {...register('email')} />
        </FormField>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Company" optional error={errors.company?.message}>
          <Input autoComplete="organization" {...register('company')} />
        </FormField>
        <FormField label="Topic" required error={errors.topic?.message}>
          <Select {...register('topic')}>
            {contactTopics.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <FormField label="Message" required error={errors.message?.message} hint="At least 20 characters.">
        <Textarea rows={6} {...register('message')} />
      </FormField>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill every input. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>

      <div>
        <div className="flex items-start gap-3">
          <Controller
            control={control}
            name="consent"
            render={({ field }) => (
              <Checkbox id="contact-consent" checked={field.value === true} onCheckedChange={(v) => field.onChange(v === true)} onBlur={field.onBlur} aria-invalid={errors.consent ? true : undefined} aria-describedby={errors.consent ? 'contact-consent-error' : undefined} className="mt-0.5" />
            )}
          />
          <label htmlFor="contact-consent" className="text-sm">
            I agree to be contacted about this request. See the <Link href="/privacy" className="text-primary underline underline-offset-2">privacy policy</Link>.
          </label>
        </div>
        {errors.consent && (
          <p id="contact-consent-error" role="alert" className="mt-1.5 text-xs font-medium text-danger">
            {errors.consent.message}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}
