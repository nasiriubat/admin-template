'use client';

import { Checkbox, Switch } from '@nexus/ui';
import { groupState, setGroup, togglePermission } from './permission-utils';
import type { PermissionGroup } from './types';

/**
 * Permission matrix: one section per module with a master checkbox and a switch per permission.
 * Stacks naturally on mobile; two columns of groups on wide screens.
 */
export function PermissionMatrix({ groups, granted, onChange, disabled, roleName }: { groups: PermissionGroup[]; granted: ReadonlySet<string>; onChange: (next: Set<string>) => void; disabled?: boolean; roleName: string }) {
  return (
    <div className="grid gap-4 2xl:grid-cols-2">
      {groups.map((group) => {
        const state = groupState(granted, group);
        const headingId = `perm-group-${group.moduleId}`;
        return (
          <section key={group.moduleId} role="group" aria-labelledby={headingId} className="rounded-card border border-border">
            <header className="flex items-center justify-between gap-3 border-b border-border bg-canvas px-4 py-3">
              <h3 id={headingId} className="text-sm font-semibold text-text">
                {group.moduleTitle}
              </h3>
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <Checkbox
                  checked={state === 'all' ? true : state === 'some' ? 'indeterminate' : false}
                  disabled={disabled}
                  aria-label={`Grant all ${group.moduleTitle} permissions to ${roleName}`}
                  onCheckedChange={(v) => onChange(setGroup(granted, group, v === true))}
                />
                All
              </label>
            </header>
            <ul className="divide-y divide-border">
              {group.permissions.map((p) => {
                const id = `perm-${p.id}`;
                return (
                  <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
                      <span className="block text-sm font-medium text-text">{p.label}</span>
                      {p.description && <span className="block text-xs text-text-muted">{p.description}</span>}
                      <span className="mt-0.5 block font-mono text-[11px] text-text-muted">{p.id}</span>
                    </label>
                    <Switch id={id} checked={granted.has(p.id)} disabled={disabled} onCheckedChange={(v) => onChange(togglePermission(granted, p.id, v))} />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
