export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export';
export type AuditResourceType = 'user' | 'role' | 'api-key' | 'webhook' | 'file' | 'setting' | 'session';
export type AuditValues = Record<string, unknown>;

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  oldValue: AuditValues | null;
  newValue: AuditValues | null;
}

export const AUDIT_ACTIONS: ReadonlyArray<{ value: AuditAction; label: string }> = [
  { value: 'create', label: 'Created' },
  { value: 'update', label: 'Updated' },
  { value: 'delete', label: 'Deleted' },
  { value: 'login', label: 'Signed in' },
  { value: 'logout', label: 'Signed out' },
  { value: 'export', label: 'Exported' },
];

export const AUDIT_RESOURCE_TYPES: ReadonlyArray<{ value: AuditResourceType; label: string }> = [
  { value: 'user', label: 'User' },
  { value: 'role', label: 'Role' },
  { value: 'api-key', label: 'API key' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'file', label: 'File' },
  { value: 'setting', label: 'Setting' },
  { value: 'session', label: 'Session' },
];

/** Demo actors. A real backend resolves these from the identity service. */
export const AUDIT_ACTORS = [
  { id: 'u-001', name: 'Avery Morgan', email: 'avery.morgan@example.com' },
  { id: 'u-002', name: 'Jordan Lee', email: 'jordan.lee@example.com' },
  { id: 'u-003', name: 'Priya Singh', email: 'priya.singh@example.com' },
  { id: 'u-004', name: 'Mateo Costa', email: 'mateo.costa@example.com' },
  { id: 'u-005', name: 'Ines Moreau', email: 'ines.moreau@example.com' },
  { id: 'u-006', name: 'Kofi Mensah', email: 'kofi.mensah@example.com' },
] as const;

export const actionLabel = (value: string) => AUDIT_ACTIONS.find((a) => a.value === value)?.label ?? value;
export const resourceLabel = (value: string) => AUDIT_RESOURCE_TYPES.find((r) => r.value === value)?.label ?? value;
