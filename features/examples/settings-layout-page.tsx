'use client';

import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { z } from '../_shared/zod';
import {
  Alert,
  Button,
  Card,
  CardContent,
  cn,
  ConfirmDialog,
  FormField,
  FormSection,
  IconRenderer,
  Input,
  PageContainer,
  PageHeader,
  Select,
  StickyActionBar,
  Switch,
  Textarea,
  toast,
  useUnsavedChangesWarning,
  useZodForm,
} from '@nexus/ui';
import { ExampleBanner } from './example-banner';

/**
 * Settings page pattern: section navigation (sidebar on desktop, Select on mobile), one card per
 * section with FormSection rows (label column + controls), a sticky save bar that tracks dirty
 * state, and a danger zone with a typed confirmation. Values live in local state here;
 * a real page would load and save through a service (see features/settings).
 */
const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: 'User' },
  { id: 'notifications', label: 'Notifications', icon: 'Bell' },
  { id: 'danger', label: 'Danger zone', icon: 'AlertTriangle' },
] as const;
type SectionId = (typeof SECTIONS)[number]['id'];

const profileSchema = z.object({
  displayName: z.string().trim().min(2, 'Enter at least 2 characters.'),
  timezone: z.string().min(1, 'Choose a timezone.'),
  bio: z.string().max(160, 'Keep it under 160 characters.'),
  emailAlerts: z.boolean(),
  pushAlerts: z.boolean(),
});
type Values = z.infer<typeof profileSchema>;
const INITIAL: Values = { displayName: 'Avery Morgan', timezone: 'Europe/Helsinki', bio: '', emailAlerts: true, pushAlerts: false };

function SettingsForm({ section, saved, onSaved, onDirtyChange }: { section: 'profile' | 'notifications'; saved: Values; onSaved: (v: Values) => void; onDirtyChange: (d: boolean) => void }) {
  const form = useZodForm(profileSchema, { defaultValues: saved });
  const { register, control, handleSubmit, reset, formState } = form;
  const { errors, isDirty, isSubmitting } = formState;
  useUnsavedChangesWarning(isDirty);
  // Tell the page about dirty state so switching sections can ask first.
  useEffect(() => {
    onDirtyChange(isDirty);
    return () => onDirtyChange(false);
  }, [isDirty, onDirtyChange]);

  const submit = handleSubmit(async (values) => {
    await new Promise((r) => setTimeout(r, 400)); // stand-in for the save request
    onSaved(values);
    reset(values); // clears dirty state against the newly saved values
    toast.success('Settings saved');
  });

  return (
    <form onSubmit={submit} noValidate>
      <Card>
        <CardContent className="space-y-6">
          {section === 'profile' ? (
            <>
              <FormSection title="Identity" description="How you appear to teammates.">
                <FormField label="Display name" required error={errors.displayName?.message}>
                  <Input autoComplete="name" {...register('displayName')} />
                </FormField>
                <FormField label="Bio" optional hint="Up to 160 characters." error={errors.bio?.message}>
                  <Textarea rows={3} {...register('bio')} />
                </FormField>
              </FormSection>
              <FormSection title="Region" description="Used for dates and digests.">
                <FormField label="Timezone" required error={errors.timezone?.message}>
                  <Select {...register('timezone')}>
                    <option value="Europe/Helsinki">Europe/Helsinki</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                  </Select>
                </FormField>
              </FormSection>
            </>
          ) : (
            <FormSection title="Channels" description="Choose where alerts reach you.">
              {(['emailAlerts', 'pushAlerts'] as const).map((name) => (
                <Controller
                  key={name}
                  control={control}
                  name={name}
                  render={({ field }) => (
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p id={`${name}-label`} className="text-sm font-medium text-text">{name === 'emailAlerts' ? 'Email alerts' : 'Push alerts'}</p>
                        <p className="text-xs text-text-muted">{name === 'emailAlerts' ? 'Important events, once a day.' : 'Instant alerts on your phone.'}</p>
                      </div>
                      <Switch aria-labelledby={`${name}-label`} checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />
              ))}
            </FormSection>
          )}
        </CardContent>
      </Card>
      <StickyActionBar dirty={isDirty}>
        <Button variant="secondary" onClick={() => reset(saved)} disabled={!isDirty || isSubmitting}>Discard</Button>
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save changes</Button>
      </StickyActionBar>
    </form>
  );
}

function DangerZone() {
  const [open, setOpen] = useState(false);
  return (
    <Card className="border-danger/40">
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text">Delete workspace</h3>
          <p className="text-sm text-text-muted">Permanently removes all data. This can’t be undone.</p>
        </div>
        <Button variant="danger" onClick={() => setOpen(true)}>Delete workspace…</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Delete this workspace?"
          description="Every project, member and file will be permanently removed."
          confirmLabel="Delete workspace"
          requireText="DELETE"
          onConfirm={() => { toast.info('Demo only: nothing was deleted'); }}
        />
      </CardContent>
    </Card>
  );
}

export function SettingsLayoutPage() {
  const [section, setSection] = useState<SectionId>('profile');
  const [saved, setSaved] = useState<Values>(INITIAL);
  const [dirty, setDirty] = useState(false);

  const go = (next: SectionId) => {
    if (next === section) return;
    if (dirty && !window.confirm('You have unsaved changes. Discard them and switch sections?')) return;
    setDirty(false);
    setSection(next);
  };
  const active = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];

  return (
    <PageContainer>
      <ExampleBanner />
      <PageHeader title="Settings layout" description="Section navigation, grouped fields, a sticky save bar and a danger zone." />
      <Alert variant="info" title="Pattern notes">Changes stay in this browser tab. Wire the save handler to your service layer.</Alert>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="md:hidden">
          <label htmlFor="example-section" className="mb-1.5 block text-sm font-medium text-text">Section</label>
          <Select id="example-section" value={section} onChange={(e) => go(e.target.value as SectionId)}>
            {SECTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
        </div>
        <nav aria-label="Settings sections" className="hidden self-start md:sticky md:top-4 md:block">
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(s.id)}
                  aria-current={s.id === section ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-input px-3 py-2 text-left text-sm font-medium',
                    s.id === section ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface hover:text-text',
                  )}
                >
                  <IconRenderer name={s.icon} className="size-4" /> {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <section aria-labelledby="example-settings-heading" className="min-w-0 space-y-4">
          <h2 id="example-settings-heading" className="text-lg font-semibold text-text">{active.label}</h2>
          {section === 'danger' ? <DangerZone /> : <SettingsForm key={section} section={section} saved={saved} onSaved={setSaved} onDirtyChange={setDirty} />}
        </section>
      </div>
    </PageContainer>
  );
}
