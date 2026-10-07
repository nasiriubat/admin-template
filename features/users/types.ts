import type { RoleId } from '../_shared/roles';

export type UserStatus = 'active' | 'invited' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleId;
  status: UserStatus;
  createdAt: string;
  lastActiveAt: string | null;
}

export const USER_STATUSES: ReadonlyArray<{ value: UserStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'suspended', label: 'Suspended' },
];

export type BulkUserAction = 'suspend' | 'activate' | 'delete';
