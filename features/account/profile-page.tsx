'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  applyServerErrors,
  Avatar,
  Button,
  Card,
  CardContent,
  FormField,
  Input,
  PageContainer,
  PageHeader,
  QueryBoundary,
  Select,
  Skeleton,
  StickyActionBar,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
  useUnsavedChangesWarning,
  useZodForm,
} from '@nexus/ui';
import { useProfile, useUpdateProfile } from './hooks';
import { profileSchema } from './schemas';
import { SecurityTab } from './security-tab';
import { LoginHistory, SessionList } from './sessions-tab';
import { PROFILE_TIMEZONES, type Profile } from './types';

function ProfileForm({ profile }: { profile: Profile }) {
  const update = useUpdateProfile();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(profileSchema, { defaultValues: profile });
  const { register, handleSubmit, reset, formState, watch } = form;
  const { errors, isDirty, isSubmitting } = formState;
  useUnsavedChangesWarning(isDirty);
  useEffect(() => reset(profile), [profile, reset]);
  const name = watch('name');

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      reset(await update.mutateAsync(values));
      toast.success('Profile updated');
    } catch (e) {
      setFormError(applyServerErrors(form as never, e));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <Card>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar name={name || profile.name} size="lg" />
            <div>
              <p className="text-sm font-medium text-text">{profile.name}</p>
              <p className="text-sm text-text-muted">{profile.email}</p>
            </div>
          </div>
          {formError && <Alert variant="danger">{formError}</Alert>}
          <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
            <FormField label="Full name" required error={errors.name?.message}>
              <Input autoComplete="name" {...register('name')} />
            </FormField>
            <FormField label="Email" required error={errors.email?.message}>
              <Input type="email" inputMode="email" autoComplete="email" {...register('email')} />
            </FormField>
            <FormField label="Timezone" hint="Used for dates and scheduled emails." error={errors.timezone?.message} className="sm:col-span-2 sm:max-w-xs">
              <Select {...register('timezone')}>
                {PROFILE_TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
              </Select>
            </FormField>
          </div>
        </CardContent>
      </Card>
      <StickyActionBar dirty={isDirty}>
        <Button variant="secondary" onClick={() => reset(profile)} disabled={!isDirty || isSubmitting}>Discard</Button>
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save changes</Button>
      </StickyActionBar>
    </form>
  );
}

export function ProfilePage() {
  const profile = useProfile();
  return (
    <PageContainer>
      <PageHeader title="Profile" description="Your personal details, password and signed-in devices." />
      <Tabs defaultValue="profile">
        <TabsList aria-label="Account sections">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <QueryBoundary
            query={profile}
            loading={<Card className="space-y-4 p-6"><Skeleton className="h-12 w-64" /><Skeleton className="h-10 w-full max-w-2xl" /><Skeleton className="h-10 w-full max-w-2xl" /></Card>}
          >
            {(data) => <ProfileForm profile={data} />}
          </QueryBoundary>
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="sessions" className="space-y-8">
          <SessionList />
          <LoginHistory />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
