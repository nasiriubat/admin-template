import { permissionCatalog } from '../index';
import type { PermissionDefinition } from './types';

/**
 * Single access point for the permission catalogue. `../index` only imports module metadata
 * (never pages), so there is no import cycle with this feature.
 */
export const catalog: PermissionDefinition[] = permissionCatalog.map((p) => ({
  id: p.id,
  label: p.label,
  description: p.description,
  moduleId: p.moduleId,
  moduleTitle: p.moduleTitle,
}));
