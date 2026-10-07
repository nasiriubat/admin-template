'use client';

import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCan } from '@nexus/auth';
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FilterBar,
  formatRelative,
  IconRenderer,
  PageContainer,
  PageHeader,
  Select,
  toast,
  useDebouncedValue,
  useTableQuery,
} from '@nexus/ui';
import { ROLE_OPTIONS, roleLabel } from '../_shared/roles';
import { useBulkUsers, useDeleteUser, useUpdateUser, useUsers } from './hooks';
import { UserFormDialog } from './user-form-dialog';
import { USER_STATUSES, type User, type UserStatus } from './types';

const statusVariant: Record<UserStatus, 'success' | 'info' | 'danger'> = { active: 'success', invited: 'info', suspended: 'danger' };
const col = createColumnHelper<User>();

export function UsersPage() {
  const canManage = useCan('users.manage');
  const { query, setQuery } = useTableQuery({ sort: 'createdAt', direction: 'desc' });
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const search = useDebouncedValue(query.search);

  const list = useUsers({ page: query.page, pageSize: query.pageSize, sort: query.sort, direction: query.direction, search, filters: { role, status } });
  const update = useUpdateUser();
  const remove = useDeleteUser();
  const bulk = useBulkUsers();

  const [editing, setEditing] = useState<User | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [bulkDelete, setBulkDelete] = useState<{ ids: string[]; clear: () => void } | null>(null);

  const activeFilters = Number(Boolean(role)) + Number(Boolean(status));
  const clearFilters = () => {
    setRole('');
    setStatus('');
    setQuery({ page: 1 });
  };

  const columns = useMemo(
    () => [
      col.accessor('name', {
        header: 'User',
        meta: { label: 'User', mobile: 'primary', alwaysVisible: true },
        cell: ({ row }) => (
          <Link href={`/users/${row.original.id}`} className="flex min-w-0 items-center gap-3 rounded">
            <Avatar name={row.original.name} size="sm" />
            <span className="min-w-0">
              <span className="block truncate font-medium text-text">{row.original.name}</span>
              <span className="block truncate text-xs text-text-muted">{row.original.email}</span>
            </span>
          </Link>
        ),
      }),
      col.accessor('role', { header: 'Role', cell: (c) => roleLabel(c.getValue()), meta: { exportValue: (u: User) => roleLabel(u.role) } }),
      col.accessor('status', {
        header: 'Status',
        cell: (c) => (
          <Badge variant={statusVariant[c.getValue()]} dot className="capitalize">
            {c.getValue()}
          </Badge>
        ),
      }),
      col.accessor('lastActiveAt', {
        header: 'Last active',
        cell: (c) => (c.getValue() ? formatRelative(c.getValue()!) : <span className="text-text-muted">Never</span>),
        meta: { exportValue: (u: User) => u.lastActiveAt ?? '' },
      }),
      col.accessor('createdAt', { header: 'Joined', cell: (c) => new Date(c.getValue()).toLocaleDateString(), meta: { mobile: 'hidden' } }),
    ],
    [],
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  async function setUserStatus(user: User, next: UserStatus) {
    try {
      await update.mutateAsync({ id: user.id, input: { status: next } });
      toast.success(next === 'suspended' ? 'User suspended' : 'User reactivated', { description: user.email });
    } catch (e) {
      toast.error('Could not update user', { description: e instanceof Error ? e.message : undefined });
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Users"
        description="Manage who can sign in, their roles and account status."
        actions={
          canManage && (
            <Button onClick={openCreate}>
              <IconRenderer name="UserPlus" className="size-4" /> Invite user
            </Button>
          )
        }
      />

      <DataTable<User>
        caption="Users"
        columns={columns}
        data={list.data?.items ?? []}
        total={list.data?.meta.total}
        getRowId={(u) => u.id}
        getRowLabel={(u) => u.name}
        mode="server"
        query={query}
        onQueryChange={setQuery}
        isLoading={list.isPending}
        isFetching={list.isFetching && !list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        searchPlaceholder="Search by name or email"
        selectable={canManage}
        exportFileName="users"
        hasActiveFilters={activeFilters > 0}
        onClearFilters={clearFilters}
        emptyTitle="No users yet"
        emptyDescription="Invite your first teammate to get started."
        emptyAction={canManage ? <Button onClick={openCreate}>Invite user</Button> : undefined}
        filters={
          <FilterBar activeCount={activeFilters} onClear={clearFilters}>
            <Select aria-label="Filter by role" value={role} onChange={(e) => { setRole(e.target.value); setQuery({ page: 1 }); }} className="md:w-40">
              <option value="">All roles</option>
              {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
            <Select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setQuery({ page: 1 }); }} className="md:w-40">
              <option value="">All statuses</option>
              {USER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </FilterBar>
        }
        bulkActions={(rows, clear) => (
          <>
            <Button size="sm" variant="secondary" loading={bulk.isPending} onClick={async () => {
              try {
                await bulk.mutateAsync({ ids: rows.map((r) => r.id), action: 'suspend' });
                toast.success(`${rows.length} user${rows.length > 1 ? 's' : ''} suspended`);
                clear();
              } catch (e) {
                toast.error('Could not update users', { description: e instanceof Error ? e.message : undefined });
              }
            }}>
              Suspend
            </Button>
            <Button size="sm" variant="secondary" loading={bulk.isPending} onClick={async () => {
              try {
                await bulk.mutateAsync({ ids: rows.map((r) => r.id), action: 'activate' });
                toast.success(`${rows.length} user${rows.length > 1 ? 's' : ''} activated`);
                clear();
              } catch (e) {
                toast.error('Could not update users', { description: e instanceof Error ? e.message : undefined });
              }
            }}>
              Activate
            </Button>
            <Button size="sm" variant="danger-ghost" onClick={() => setBulkDelete({ ids: rows.map((r) => r.id), clear })}>
              Delete…
            </Button>
          </>
        )}
        rowActions={(user) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${user.name}`}>
                <IconRenderer name="MoreHorizontal" className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href={`/users/${user.id}`}><IconRenderer name="Eye" className="size-4" /> View details</Link>
              </DropdownMenuItem>
              {canManage && (
                <>
                  <DropdownMenuItem onSelect={() => { setEditing(user); setFormOpen(true); }}>
                    <IconRenderer name="Pencil" className="size-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => void setUserStatus(user, user.status === 'suspended' ? 'active' : 'suspended')}>
                    <IconRenderer name={user.status === 'suspended' ? 'Play' : 'Pause'} className="size-4" />
                    {user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive onSelect={() => setDeleting(user)}>
                    <IconRenderer name="Trash2" className="size-4" /> Delete…
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name ?? 'user'}?`}
        description="This permanently removes the account and revokes all of its sessions. This can’t be undone."
        confirmLabel="Delete user"
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success('User deleted', { description: deleting.email });
        }}
      />
      <ConfirmDialog
        open={Boolean(bulkDelete)}
        onOpenChange={(open) => !open && setBulkDelete(null)}
        title={`Delete ${bulkDelete?.ids.length ?? 0} users?`}
        description="These accounts will be permanently removed. This can’t be undone."
        confirmLabel="Delete users"
        requireText="DELETE"
        onConfirm={async () => {
          if (!bulkDelete) return;
          await bulk.mutateAsync({ ids: bulkDelete.ids, action: 'delete' });
          toast.success(`${bulkDelete.ids.length} users deleted`);
          bulkDelete.clear();
        }}
      />
    </PageContainer>
  );
}
