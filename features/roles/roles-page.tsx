'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCan } from '@nexus/auth';
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  IconRenderer,
  PageContainer,
  PageHeader,
  QueryBoundary,
  Select,
  Skeleton,
  StickyActionBar,
  toast,
  UnauthorizedState,
  useUnsavedChangesWarning,
  cn,
} from '@nexus/ui';
import { catalog as localCatalog } from './catalog';
import { CreateRoleDialog } from './create-role-dialog';
import { useDeleteRole, usePermissionCatalog, useRoles, useUpdateRole } from './hooks';
import { PermissionMatrix } from './permission-matrix';
import { effectivePermissions, groupPermissions, hasAll, sameSet } from './permission-utils';
import type { Role } from './types';

const LEAVE_MESSAGE = 'You have unsaved permission changes. Discard them?';

function RolesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[18rem_1fr]" aria-hidden="true">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export function RolesPage() {
  const canView = useCan('roles.view');
  const canManage = useCan('roles.manage');
  const rolesQuery = useRoles();
  const permissionsQuery = usePermissionCatalog();
  const update = useUpdateRole();
  const remove = useDeleteRole();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<Role | null>(null);

  const roles = rolesQuery.data;
  const selected = roles?.find((r) => r.id === selectedId) ?? roles?.[0];
  const catalog = permissionsQuery.data ?? localCatalog;
  const groups = useMemo(() => groupPermissions(catalog), [catalog]);
  const saved = useMemo(() => (selected ? effectivePermissions(selected, catalog) : new Set<string>()), [selected, catalog]);
  const dirty = !sameSet(draft, saved);
  const locked = !selected || hasAll(selected) || !canManage;

  useUnsavedChangesWarning(dirty, LEAVE_MESSAGE);

  // Load the draft from the server copy when the role (or its saved permissions) changes.
  const savedKey = `${selected?.id ?? ''}|${[...saved].sort().join(',')}`;
  useEffect(() => {
    setDraft(new Set(saved));
  }, [savedKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!canView) return <UnauthorizedState size="page" />;

  function select(id: string) {
    if (id === selected?.id) return;
    if (dirty && !window.confirm(LEAVE_MESSAGE)) return;
    setSelectedId(id);
  }

  async function save() {
    if (!selected) return;
    try {
      await update.mutateAsync({ id: selected.id, patch: { permissions: [...draft].sort() } });
      toast.success('Permissions saved', { description: selected.name });
    } catch (e) {
      toast.error('Could not save permissions', { description: e instanceof Error ? e.message : undefined });
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Roles & Permissions"
        description="Control what each role can see and do across modules."
        actions={
          canManage && (
            <Button onClick={() => setCreateOpen(true)}>
              <IconRenderer name="Plus" className="size-4" /> Create role
            </Button>
          )
        }
      />

      <QueryBoundary
        query={rolesQuery}
        loading={<RolesSkeleton />}
        isEmpty={(data) => data.length === 0}
        empty={
          <Card>
            <EmptyState icon="ShieldCheck" title="No roles yet" description="Create a role to start granting permissions." actions={canManage ? <Button onClick={() => setCreateOpen(true)}>Create role</Button> : undefined} />
          </Card>
        }
      >
        {(list) =>
          selected && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[18rem_minmax(0,1fr)] md:items-start">
              {/* Mobile: role selector */}
              <div className="md:hidden">
                <label htmlFor="role-select" className="mb-1.5 block text-sm font-medium text-text">
                  Role
                </label>
                <Select id="role-select" value={selected.id} onChange={(e) => select(e.target.value)}>
                  {list.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.memberCount})
                    </option>
                  ))}
                </Select>
              </div>

              {/* Desktop: role list */}
              <nav aria-label="Roles" className="hidden rounded-card border border-border bg-surface p-2 shadow-card md:block">
                <ul className="space-y-1">
                  {list.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        aria-current={r.id === selected.id ? 'true' : undefined}
                        onClick={() => select(r.id)}
                        className={cn('flex w-full items-center justify-between gap-2 rounded-input px-3 py-2.5 text-left text-sm', r.id === selected.id ? 'bg-primary/10 text-primary' : 'text-text hover:bg-canvas')}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{r.name}</span>
                          <span className="block text-xs text-text-muted">
                            {r.memberCount} member{r.memberCount === 1 ? '' : 's'}
                          </span>
                        </span>
                        {r.system && <IconRenderer name="Lock" className="size-3.5 shrink-0 text-text-muted" aria-label="System role" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <section aria-label={`${selected.name} permissions`} className="min-w-0 space-y-4">
                <Card className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-text">{selected.name}</h2>
                        <Badge variant={selected.system ? 'info' : 'neutral'}>{selected.system ? 'System role' : 'Custom role'}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-text-muted">{selected.description || 'No description.'}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {selected.memberCount} member{selected.memberCount === 1 ? '' : 's'} · {saved.size} of {catalog.length} permissions
                      </p>
                    </div>
                    {canManage && !selected.system && (
                      <Button variant="danger-ghost" onClick={() => setDeleting(selected)}>
                        <IconRenderer name="Trash2" className="size-4" /> Delete role
                      </Button>
                    )}
                  </div>
                  {hasAll(selected) && <Alert variant="info" className="mt-3">Super Admin always has every permission and can’t be edited.</Alert>}
                  {!canManage && !hasAll(selected) && <Alert variant="info" className="mt-3">You can view this role but don’t have permission to change it.</Alert>}
                </Card>

                <PermissionMatrix groups={groups} granted={draft} onChange={setDraft} disabled={locked} roleName={selected.name} />

                {!locked && (
                  <StickyActionBar dirty={dirty}>
                    <Button variant="secondary" disabled={!dirty || update.isPending} onClick={() => setDraft(new Set(saved))}>
                      Discard
                    </Button>
                    <Button disabled={!dirty} loading={update.isPending} onClick={() => void save()}>
                      Save changes
                    </Button>
                  </StickyActionBar>
                )}
              </section>

              <CreateRoleDialog open={createOpen} onOpenChange={setCreateOpen} roles={list} onCreated={(role) => setSelectedId(role.id)} />
              <ConfirmDialog
                open={Boolean(deleting)}
                onOpenChange={(open) => !open && setDeleting(null)}
                title={`Delete ${deleting?.name ?? 'role'}?`}
                description="Members must be reassigned first. The role and its permissions are removed permanently."
                confirmLabel="Delete role"
                requireText={deleting?.name}
                onConfirm={async () => {
                  if (!deleting) return;
                  await remove.mutateAsync(deleting.id);
                  toast.success('Role deleted', { description: deleting.name });
                  setSelectedId(null);
                }}
              />
            </div>
          )
        }
      </QueryBoundary>
    </PageContainer>
  );
}
