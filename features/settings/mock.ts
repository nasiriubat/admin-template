import { ApiError } from '@nexus/api-client';
import { mockRouter } from '../_shared/mock-router';
import { generalSchema, notificationsSchema, securitySchema } from './schemas';
import { DEFAULT_SETTINGS, type SettingsCategory, type WorkspaceSettings } from './types';

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
let state: WorkspaceSettings = clone(DEFAULT_SETTINGS);

const schemas = { general: generalSchema, security: securitySchema, notifications: notificationsSchema } as const;

mockRouter.on('GET', '/settings', () => clone(state));
mockRouter.on('PUT', '/settings/:category', ({ params, body }) => {
  const category = params.category as SettingsCategory;
  const schema = schemas[category];
  if (!schema) throw new ApiError('NOT_FOUND', 'Unknown settings category.', 404);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[issue.path.join('.') || 'form'] = issue.message;
    throw new ApiError('VALIDATION_ERROR', 'Some of the information provided is not valid.', 422, fields);
  }
  state = { ...state, [category]: parsed.data } as WorkspaceSettings;
  return clone(state[category]);
});
mockRouter.on('POST', '/settings/reset-demo', () => {
  state = clone(DEFAULT_SETTINGS);
  return { reset: true };
});
mockRouter.on('DELETE', '/settings/workspace', () => ({ deleted: true }));
