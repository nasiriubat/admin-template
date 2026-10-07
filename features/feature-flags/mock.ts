import { ApiError, createCollection } from '@nexus/api-client';
import { createRng, daysAgo, minutesAgo } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import { matchesFlagFilters } from './flag-utils';
import type { FeatureFlag, FlagEnvironment } from './types';

const rng = createRng(20260315);
const OWNERS = ['Growth', 'Platform', 'Payments', 'Search', 'Mobile', 'Design Systems'] as const;

const SEED: Array<[string, string, [boolean, boolean, boolean], number]> = [
  ['new-checkout-flow', 'Single-page checkout with saved payment methods.', [true, true, true], 35],
  ['dark-mode-v2', 'Refreshed dark palette across the app shell.', [true, true, true], 100],
  ['ai-search-suggestions', 'Semantic query suggestions in global search.', [false, true, true], 10],
  ['bulk-export-csv', 'Server-side CSV export for large tables.', [true, true, true], 100],
  ['realtime-notifications', 'Push notifications over server-sent events.', [false, true, true], 0],
  ['usage-based-billing', 'Metered billing for API usage.', [false, false, true], 0],
  ['team-workspaces', 'Multiple workspaces per organization.', [true, true, true], 60],
  ['inline-table-editing', 'Edit cells directly in data tables.', [false, true, true], 25],
  ['sso-saml', 'SAML single sign-on for enterprise plans.', [true, true, true], 100],
  ['audit-log-streaming', 'Stream audit events to external SIEM endpoints.', [false, true, false], 0],
  ['onboarding-checklist', 'Guided setup checklist on first login.', [true, true, true], 80],
  ['webhook-retries-v2', 'Exponential backoff with jitter for failed deliveries.', [true, true, true], 50],
  ['mobile-bottom-nav', 'Bottom navigation on small screens.', [true, true, true], 100],
  ['command-palette', 'Keyboard-driven command palette.', [true, true, true], 100],
  ['saved-filters', 'Save and share table filter presets.', [false, true, true], 15],
  ['legacy-reports-sunset', 'Hide the legacy reports page.', [false, false, false], 0],
  ['two-factor-enforcement', 'Require 2FA for admin roles.', [false, true, false], 5],
  ['invoice-pdf-v3', 'Redesigned invoice PDFs.', [true, true, true], 90],
];

const seed: FeatureFlag[] = SEED.map(([key, description, [production, staging, development], rollout], i) => ({
  id: `ff-${String(i + 1).padStart(3, '0')}`,
  key,
  description,
  environments: { production, staging, development },
  rollout,
  owner: OWNERS[i % OWNERS.length],
  createdAt: daysAgo(rng.int(20, 300)),
  updatedAt: minutesAgo(rng.int(30, 60 * 24 * 40)),
}));

const options = {
  searchFields: ['key', 'description', 'owner'] as Array<keyof FeatureFlag>,
  defaultSort: { field: 'updatedAt' as const, direction: 'desc' as const },
};
const flags = createCollection<FeatureFlag>(seed, options);

function assertUniqueKey(key: string) {
  if (flags.all().some((f) => f.key === key)) {
    throw new ApiError('VALIDATION_ERROR', 'Some of the information provided is not valid.', 422, { key: 'A flag with this key already exists.' });
  }
}

mockRouter.on('GET', '/feature-flags', ({ query }) => {
  const env = typeof query['filter[environment]'] === 'string' ? (query['filter[environment]'] as string) : '';
  const status = typeof query['filter[status]'] === 'string' ? (query['filter[status]'] as string) : '';
  const filtered = flags.all().filter((f) => matchesFlagFilters(f, env, status));
  return createCollection<FeatureFlag>(filtered, options).list(query);
});
mockRouter.on('GET', '/feature-flags/:id', ({ params }) => flags.get(params.id));
mockRouter.on('POST', '/feature-flags', ({ body }) => {
  const input = body as Pick<FeatureFlag, 'key' | 'description' | 'owner'>;
  assertUniqueKey(input.key);
  const now = new Date().toISOString();
  // New flags always start off everywhere.
  return flags.create({ ...input, environments: { production: false, staging: false, development: false }, rollout: 0, createdAt: now, updatedAt: now });
});
mockRouter.on('PATCH', '/feature-flags/:id', ({ params, body }) => {
  const { description, owner, rollout } = body as Partial<Pick<FeatureFlag, 'description' | 'owner' | 'rollout'>>;
  return flags.update(params.id, { ...(description !== undefined && { description }), ...(owner !== undefined && { owner }), ...(rollout !== undefined && { rollout }), updatedAt: new Date().toISOString() });
});
mockRouter.on('POST', '/feature-flags/:id/toggle', ({ params, body }) => {
  const { environment, enabled } = body as { environment: FlagEnvironment; enabled: boolean };
  const current = flags.get(params.id);
  return flags.update(params.id, { environments: { ...current.environments, [environment]: enabled }, updatedAt: new Date().toISOString() });
});
mockRouter.on('DELETE', '/feature-flags/:id', ({ params }) => flags.remove(params.id));
