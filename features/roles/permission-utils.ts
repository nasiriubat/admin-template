import { WILDCARD, type PermissionDefinition, type PermissionGroup, type Role } from './types';

/** Group a flat permission list by module, keeping the catalogue order. */
export function groupPermissions(permissions: PermissionDefinition[]): PermissionGroup[] {
  const groups = new Map<string, PermissionGroup>();
  for (const p of permissions) {
    const group = groups.get(p.moduleId) ?? { moduleId: p.moduleId, moduleTitle: p.moduleTitle, permissions: [] };
    group.permissions.push(p);
    groups.set(p.moduleId, group);
  }
  return [...groups.values()];
}

export const hasAll = (role: Pick<Role, 'permissions'>) => role.permissions.includes(WILDCARD);

/** Expand a role's stored permissions into a concrete set against the catalogue. */
export function effectivePermissions(role: Pick<Role, 'permissions'>, catalog: PermissionDefinition[]): Set<string> {
  return hasAll(role) ? new Set(catalog.map((p) => p.id)) : new Set(role.permissions);
}

export function togglePermission(current: ReadonlySet<string>, id: string, granted: boolean): Set<string> {
  const next = new Set(current);
  if (granted) next.add(id);
  else next.delete(id);
  return next;
}

/** Grant or revoke every permission in a group at once. */
export function setGroup(current: ReadonlySet<string>, group: PermissionGroup, granted: boolean): Set<string> {
  const next = new Set(current);
  for (const p of group.permissions) {
    if (granted) next.add(p.id);
    else next.delete(p.id);
  }
  return next;
}

export type GroupState = 'all' | 'some' | 'none';

export function groupState(current: ReadonlySet<string>, group: PermissionGroup): GroupState {
  const granted = group.permissions.filter((p) => current.has(p.id)).length;
  return granted === 0 ? 'none' : granted === group.permissions.length ? 'all' : 'some';
}

export function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

export const slugify = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
