import { describe, expect, it } from 'vitest';
import { effectivePermissions, groupPermissions, groupState, sameSet, setGroup, slugify, togglePermission } from './permission-utils';
import type { PermissionDefinition } from './types';

const cat: PermissionDefinition[] = [
  { id: 'users.view', label: 'View users', moduleId: 'users', moduleTitle: 'Users' },
  { id: 'users.manage', label: 'Manage users', moduleId: 'users', moduleTitle: 'Users' },
  { id: 'audit.view', label: 'View audit', moduleId: 'audit', moduleTitle: 'Audit Log' },
];

describe('permission utils', () => {
  it('groups by module in catalogue order', () => {
    const groups = groupPermissions(cat);
    expect(groups.map((g) => [g.moduleId, g.permissions.length])).toEqual([['users', 2], ['audit', 1]]);
  });

  it('expands the wildcard', () => {
    expect(effectivePermissions({ permissions: ['*'] }, cat).size).toBe(3);
    expect([...effectivePermissions({ permissions: ['audit.view'] }, cat)]).toEqual(['audit.view']);
  });

  it('toggles without mutating', () => {
    const base = new Set(['users.view']);
    const next = togglePermission(base, 'audit.view', true);
    expect(base.size).toBe(1);
    expect(next.has('audit.view')).toBe(true);
    expect(togglePermission(next, 'audit.view', false).has('audit.view')).toBe(false);
  });

  it('reports and applies group state', () => {
    const [users] = groupPermissions(cat);
    expect(groupState(new Set(), users)).toBe('none');
    expect(groupState(new Set(['users.view']), users)).toBe('some');
    expect(groupState(setGroup(new Set(), users, true), users)).toBe('all');
    expect(setGroup(new Set(['users.view', 'users.manage']), users, false).size).toBe(0);
  });

  it('compares sets and slugifies names', () => {
    expect(sameSet(new Set(['a', 'b']), new Set(['b', 'a']))).toBe(true);
    expect(sameSet(new Set(['a']), new Set(['a', 'b']))).toBe(false);
    expect(slugify('  Support Agent! ')).toBe('support-agent');
  });
});
