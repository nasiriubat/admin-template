'use client';

import { useCallback, useRef, useState } from 'react';
import { useCan } from '@nexus/auth';
import { Alert, Card, cn, IconRenderer, PageContainer, PageHeader, QueryBoundary, Select, Skeleton } from '@nexus/ui';
import { DangerZone } from './danger-zone';
import { useSettings } from './hooks';
import { GeneralForm, NotificationsForm, SecurityForm } from './settings-forms';

const CATEGORIES = [
  { id: 'general', label: 'General', icon: 'Sliders', description: 'Workspace name, support contact and regional defaults.' },
  { id: 'security', label: 'Security', icon: 'ShieldAlert', description: 'Sign-in rules, session length and allowed domains.' },
  { id: 'notifications', label: 'Notifications', icon: 'Bell', description: 'Choose which events notify the team, and how.' },
  { id: 'danger', label: 'Danger zone', icon: 'AlertTriangle', description: 'Reset or permanently delete this workspace.' },
] as const;
type CategoryId = (typeof CATEGORIES)[number]['id'];

const UNSAVED = 'You have unsaved changes. Discard them and switch sections?';

function SettingsSkeleton() {
  return (
    <Card className="space-y-4 p-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-2/3" />
    </Card>
  );
}

export function SettingsPage() {
  const canManage = useCan('settings.manage');
  const [category, setCategory] = useState<CategoryId>('general');
  const dirty = useRef(false);
  const onDirtyChange = useCallback((value: boolean) => {
    dirty.current = value;
  }, []);
  const query = useSettings();

  const go = (next: CategoryId) => {
    if (next === category) return;
    if (dirty.current && !window.confirm(UNSAVED)) return;
    dirty.current = false;
    setCategory(next);
  };
  const active = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0];
  const readOnly = !canManage;

  return (
    <PageContainer>
      <PageHeader title="Settings" description="Workspace-wide configuration. Changes apply to every member." />

      {readOnly && (
        <Alert variant="info" title="Read-only access">
          You can view these settings but your role does not include permission to change them. Ask a workspace admin if something needs updating.
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[14rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="md:hidden">
          <label htmlFor="settings-category" className="mb-1.5 block text-sm font-medium text-text">Section</label>
          <Select id="settings-category" value={category} onChange={(e) => go(e.target.value as CategoryId)}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
        </div>
        <nav aria-label="Settings sections" className="hidden self-start md:sticky md:top-4 md:block">
          <ul className="space-y-1">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => go(c.id)}
                  aria-current={c.id === category ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-input px-3 py-2 text-left text-sm font-medium transition-colors',
                    c.id === category ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface hover:text-text',
                    c.id === 'danger' && c.id !== category && 'text-danger hover:text-danger',
                  )}
                >
                  <IconRenderer name={c.icon} className="size-4" />
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="settings-heading" className="min-w-0 space-y-4">
          <div>
            <h2 id="settings-heading" className="text-lg font-semibold text-text">{active.label}</h2>
            <p className="text-sm text-text-muted">{active.description}</p>
          </div>
          <QueryBoundary query={query} loading={<SettingsSkeleton />}>
            {(data) => {
              switch (category) {
                case 'general':
                  return <GeneralForm data={data.general} readOnly={readOnly} onDirtyChange={onDirtyChange} />;
                case 'security':
                  return <SecurityForm data={data.security} readOnly={readOnly} onDirtyChange={onDirtyChange} />;
                case 'notifications':
                  return <NotificationsForm data={data.notifications} readOnly={readOnly} onDirtyChange={onDirtyChange} />;
                default:
                  return <DangerZone readOnly={readOnly} workspaceName={data.general.workspaceName} />;
              }
            }}
          </QueryBoundary>
        </section>
      </div>
    </PageContainer>
  );
}
