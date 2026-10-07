import type { ModuleDefinition } from '@nexus/config';
import { dashboardModule } from './dashboard/module';
import { analyticsModule } from './analytics/module';
import { usersModule } from './users/module';
import { rolesModule } from './roles/module';
import { auditModule } from './audit/module';
import { healthModule } from './health/module';
import { logsModule } from './logs/module';
import { jobsModule } from './jobs/module';
import { filesModule } from './files/module';
import { featureFlagsModule } from './feature-flags/module';
import { apiKeysModule } from './api-keys/module';
import { webhooksModule } from './webhooks/module';
import { settingsModule } from './settings/module';
import { themeModule } from './theme/module';
import { notificationsModule } from './notifications/module';
import { accountModule } from './account/module';
import { aiModule } from './ai/module';
import { billingModule } from './billing/module';
import { knowledgeModule } from './knowledge/module';

/** Every module shipped with Nexus Admin. Projects enable/disable optional ones via AppConfig.modules. */
export const allModules: ModuleDefinition[] = [
  dashboardModule,
  analyticsModule,
  usersModule,
  rolesModule,
  auditModule,
  healthModule,
  logsModule,
  jobsModule,
  filesModule,
  featureFlagsModule,
  apiKeysModule,
  webhooksModule,
  settingsModule,
  themeModule,
  notificationsModule,
  accountModule,
  aiModule,
  knowledgeModule,
  billingModule,
];

/** Flat catalogue of every permission declared by the shipped modules (used by the Roles editor). */
export const permissionCatalog = allModules.flatMap((m) => m.permissions.map((p) => ({ ...p, moduleId: m.id, moduleTitle: m.title })));
