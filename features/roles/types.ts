export interface Role {
  id: string;
  name: string;
  description: string;
  /** System roles can't be renamed or deleted. */
  system: boolean;
  /** Permission ids. A role holding `*` has every permission and is read-only in the editor. */
  permissions: string[];
  memberCount: number;
}

export interface PermissionDefinition {
  id: string;
  label: string;
  description?: string;
  moduleId: string;
  moduleTitle: string;
}

export interface PermissionGroup {
  moduleId: string;
  moduleTitle: string;
  permissions: PermissionDefinition[];
}

export const WILDCARD = '*';
