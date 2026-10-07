import { ApiError } from '@nexus/api-client';
import { mockRouter } from '../_shared/mock-router';
import { catalog } from './catalog';
import { slugify } from './permission-utils';
import { WILDCARD, type Role } from './types';

const ids = catalog.map((p) => p.id);
const viewOnly = ids.filter((id) => id.endsWith('.view'));

let roles: Role[] = [
  { id: 'super-admin', name: 'Super Admin', description: 'Unrestricted access to everything, including billing-level settings.', system: true, permissions: [WILDCARD], memberCount: 1 },
  { id: 'admin', name: 'Admin', description: 'Runs the workspace day to day. Cannot change roles.', system: true, permissions: ids.filter((id) => id !== 'roles.manage'), memberCount: 6 },
  { id: 'editor', name: 'Editor', description: 'Manages content and files, and can see operational data.', system: true, permissions: viewOnly.filter((id) => !id.startsWith('roles.') && !id.startsWith('webhooks.') && !id.startsWith('api-keys.')).concat(ids.filter((id) => id.startsWith('files.') && !id.endsWith('.view'))), memberCount: 14 },
  { id: 'viewer', name: 'Viewer', description: 'Read-only access to dashboards and reports.', system: true, permissions: ['dashboard.view', 'analytics.view', 'health.view', 'notifications.view'].filter((id) => ids.includes(id)), memberCount: 27 },
  { id: 'support-agent', name: 'Support Agent', description: 'Helps customers: can see users and the audit trail.', system: false, permissions: ['dashboard.view', 'users.view', 'audit.view', 'notifications.view'].filter((id) => ids.includes(id)), memberCount: 4 },
  { id: 'billing-analyst', name: 'Billing Analyst', description: 'Reviews usage and reports without touching accounts.', system: false, permissions: ['dashboard.view', 'analytics.view', 'logs.view'].filter((id) => ids.includes(id)), memberCount: 2 },
];

const find = (id: string) => {
  const role = roles.find((r) => r.id === id);
  if (!role) throw new ApiError('NOT_FOUND', 'Role not found.', 404);
  return role;
};

mockRouter.on('GET', '/roles', () => roles);
mockRouter.on('GET', '/permissions', () => catalog);
mockRouter.on('POST', '/roles', ({ body }) => {
  const input = body as { name: string; description?: string; copyFrom?: string };
  const name = input.name.trim();
  if (roles.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
    throw new ApiError('VALIDATION_ERROR', 'Some of the information provided is not valid.', 422, { name: 'A role with this name already exists.' });
  }
  const source = input.copyFrom ? roles.find((r) => r.id === input.copyFrom) : undefined;
  const role: Role = {
    id: slugify(name) || `role-${roles.length + 1}`,
    name,
    description: input.description ?? '',
    system: false,
    permissions: source ? [...source.permissions] : [],
    memberCount: 0,
  };
  roles = [...roles, role];
  return role;
});
mockRouter.on('PATCH', '/roles/:id', ({ params, body }) => {
  const role = find(params.id);
  const patch = body as Partial<Pick<Role, 'permissions' | 'name' | 'description'>>;
  if (role.permissions.includes(WILDCARD)) throw new ApiError('FORBIDDEN', 'The Super Admin role can’t be edited.', 403);
  if (role.system && patch.name !== undefined && patch.name !== role.name) throw new ApiError('FORBIDDEN', 'System roles can’t be renamed.', 403);
  const next = { ...role, ...patch };
  roles = roles.map((r) => (r.id === role.id ? next : r));
  return next;
});
mockRouter.on('DELETE', '/roles/:id', ({ params }) => {
  const role = find(params.id);
  if (role.system) throw new ApiError('FORBIDDEN', 'System roles can’t be deleted.', 403);
  if (role.memberCount > 0) throw new ApiError('CONFLICT', `Reassign the ${role.memberCount} member${role.memberCount === 1 ? '' : 's'} before deleting this role.`, 409);
  roles = roles.filter((r) => r.id !== role.id);
  return { id: role.id };
});
