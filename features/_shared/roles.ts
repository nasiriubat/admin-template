/** Role ids used across the demo data. A real backend owns the role catalogue (GET /roles). */
export const ROLE_OPTIONS = [
  { value: 'super-admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
] as const;

export type RoleId = (typeof ROLE_OPTIONS)[number]['value'];

export const roleLabel = (id: string) => ROLE_OPTIONS.find((r) => r.value === id)?.label ?? id;
