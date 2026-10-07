'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Alert,
  applyServerErrors,
  Button,
  Card,
  CardContent,
  DescriptionList,
  FormField,
  IconRenderer,
  Input,
  PageContainer,
  PageHeader,
  Select,
  StateMessage,
  Stepper,
  Switch,
  TagInput,
  useUnsavedChangesWarning,
  useZodForm,
} from '@nexus/ui';
import { api } from '../_shared/api';
import { ExampleBanner } from './example-banner';
import {
  accountStepSchema,
  EMPTY_ACCOUNT,
  EMPTY_PREFERENCES,
  preferencesStepSchema,
  REGIONS,
  WIZARD_STEPS,
  type AccountStepValues,
  type PreferencesStepValues,
} from './wizard-schemas';

interface StepProps<T> {
  defaults: T;
  /** Reports whether this step has edits so the page can warn before leaving. */
  onDirtyChange: (dirty: boolean) => void;
  onBack?: () => void;
  onNext: (values: T) => void;
  serverError?: unknown;
}

function StepActions({ onBack, nextLabel = 'Continue' }: { onBack?: () => void; nextLabel?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
      {onBack ? <Button variant="secondary" onClick={onBack}>Back</Button> : <span />}
      <Button type="submit">{nextLabel}</Button>
    </div>
  );
}

function AccountStep({ defaults, onDirtyChange, onNext, serverError }: StepProps<AccountStepValues>) {
  const form = useZodForm(accountStepSchema, { defaultValues: defaults });
  const { register, handleSubmit, formState } = form;
  useEffect(() => onDirtyChange(formState.isDirty), [formState.isDirty, onDirtyChange]);
  useEffect(() => {
    if (serverError) applyServerErrors(form as never, serverError);
  }, [serverError, form]);
  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-5" aria-label="Account details">
      <FormField label="Workspace name" required hint="Shown to everyone you invite." error={formState.errors.workspaceName?.message}>
        <Input autoComplete="organization" {...register('workspaceName')} />
      </FormField>
      <FormField label="Admin email" required error={formState.errors.adminEmail?.message}>
        <Input type="email" inputMode="email" autoComplete="email" {...register('adminEmail')} />
      </FormField>
      <StepActions />
    </form>
  );
}

function PreferencesStep({ defaults, onDirtyChange, onBack, onNext }: StepProps<PreferencesStepValues>) {
  const form = useZodForm(preferencesStepSchema, { defaultValues: defaults });
  const { register, handleSubmit, setValue, watch, formState } = form;
  useEffect(() => onDirtyChange(formState.isDirty), [formState.isDirty, onDirtyChange]);
  const invitees = watch('invitees') ?? [];
  const digest = watch('weeklyDigest');
  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-5" aria-label="Preferences">
      <FormField label="Data region" required error={formState.errors.region?.message}>
        <Select {...register('region')}>
          {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </Select>
      </FormField>
      <FormField label="Invite teammates" optional hint="Enter email addresses; press Enter or comma after each." error={formState.errors.invitees?.message as string | undefined}>
        {(a) => (
          <TagInput
            {...a}
            value={invitees}
            maxTags={5}
            validate={(t) => (/^\S+@\S+\.\S+$/.test(t) ? true : 'Enter a valid email address.')}
            onChange={(next) => setValue('invitees', next, { shouldDirty: true, shouldValidate: true })}
          />
        )}
      </FormField>
      <div className="flex items-center justify-between gap-4 rounded-input border border-border p-3">
        <div>
          <p id="digest-label" className="text-sm font-medium text-text">Weekly digest</p>
          <p className="text-xs text-text-muted">A summary email every Monday.</p>
        </div>
        <Switch aria-labelledby="digest-label" checked={digest} onCheckedChange={(v) => setValue('weeklyDigest', v, { shouldDirty: true })} />
      </div>
      <StepActions onBack={onBack} />
    </form>
  );
}

/**
 * Multi-step form pattern: Stepper + one useZodForm per step + a review step.
 * Data from finished steps lives in this component; nothing is sent until the review step confirms.
 */
export function WizardPage() {
  const [step, setStep] = useState(0);
  const [account, setAccount] = useState<AccountStepValues>(EMPTY_ACCOUNT);
  const [prefs, setPrefs] = useState<PreferencesStepValues>(EMPTY_PREFERENCES);
  const [stepDirty, setStepDirty] = useState(false);
  const [serverError, setServerError] = useState<unknown>(null);

  const submit = useMutation({ mutationFn: () => api.post<{ reference: string }>('/examples/onboarding', { ...account, ...prefs }) });
  const done = submit.isSuccess;
  const touched = account.workspaceName !== '' || account.adminEmail !== '' || stepDirty;
  // Warn on reload/close/in-app links while there is unsent work. Disabled after success.
  useUnsavedChangesWarning(touched && !done);

  const submitError = submit.error as { fields?: Record<string, string> } | null;

  async function create() {
    setServerError(null);
    try {
      await submit.mutateAsync();
    } catch (e) {
      // Field-level failures go back to the step that owns the field; others stay on review.
      if ((e as { fields?: Record<string, string> }).fields?.workspaceName) {
        setServerError(e);
        setStep(0);
      }
    }
  }

  function reset() {
    submit.reset();
    setAccount(EMPTY_ACCOUNT);
    setPrefs(EMPTY_PREFERENCES);
    setStep(0);
    setStepDirty(false);
  }

  return (
    <PageContainer>
      <ExampleBanner />
      <PageHeader title="Create workspace (wizard)" description="Stepper, one validated form per step, a review step and a success state." />

      {done ? (
        <Card>
          <CardContent>
            <StateMessage
              size="page"
              icon="CheckCircle2"
              title="Workspace created"
              description={<>Reference <strong>{submit.data?.reference}</strong>. We sent a confirmation to {account.adminEmail}.</>}
              actions={
                <>
                  <Button variant="secondary" onClick={reset}>Create another</Button>
                  <Button asChild><Link href="/examples/components">Back to examples</Link></Button>
                </>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-6">
            <Stepper steps={[...WIZARD_STEPS]} current={step} onStepClick={(i) => setStep(i)} label="Create workspace steps" />
            <div aria-live="polite">
              <h2 className="text-base font-semibold text-text">{WIZARD_STEPS[step].label}</h2>
            </div>
            {step === 0 && (
              <AccountStep
                defaults={account}
                serverError={serverError}
                onDirtyChange={setStepDirty}
                onNext={(v) => { setAccount(v); setStepDirty(false); setStep(1); }}
              />
            )}
            {step === 1 && (
              <PreferencesStep
                defaults={prefs}
                onDirtyChange={setStepDirty}
                onBack={() => setStep(0)}
                onNext={(v) => { setPrefs(v); setStepDirty(false); setStep(2); }}
              />
            )}
            {step === 2 && (
              <div className="space-y-5">
                {submit.isError && !submitError?.fields && (
                  <Alert variant="danger" title="Could not create the workspace">{submit.error instanceof Error ? submit.error.message : 'Please try again.'}</Alert>
                )}
                <DescriptionList
                  columns={2}
                  items={[
                    { label: 'Workspace', value: account.workspaceName },
                    { label: 'Admin email', value: account.adminEmail },
                    { label: 'Region', value: REGIONS.find((r) => r.value === prefs.region)?.label },
                    { label: 'Weekly digest', value: prefs.weeklyDigest ? 'On' : 'Off' },
                    { label: 'Invitees', value: prefs.invitees.length ? prefs.invitees.join(', ') : null, wide: true },
                  ]}
                />
                <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                  <Button variant="secondary" onClick={() => setStep(1)} disabled={submit.isPending}>Back</Button>
                  <Button onClick={() => void create()} loading={submit.isPending}>
                    <IconRenderer name="Rocket" className="size-4" /> Create workspace
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
