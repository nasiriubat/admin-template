import type { Paginated } from '@nexus/api-client';
import type { FeatureFlag, FlagEnvironment, FlagStatusFilter } from './types';

/** Pure toggle used for the optimistic update; mirrors what the server does. */
export function applyToggle(flag: FeatureFlag, environment: FlagEnvironment, enabled: boolean): FeatureFlag {
  return { ...flag, environments: { ...flag.environments, [environment]: enabled } };
}

export function patchFlagInPage(page: Paginated<FeatureFlag> | undefined, id: string, fn: (flag: FeatureFlag) => FeatureFlag) {
  if (!page) return page;
  return { ...page, items: page.items.map((f) => (f.id === id ? fn(f) : f)) };
}

/** Does a flag match the environment/status filter pair? Empty strings mean "any". */
export function matchesFlagFilters(flag: FeatureFlag, environment: string, status: string): boolean {
  const envs = Object.entries(flag.environments) as Array<[FlagEnvironment, boolean]>;
  const relevant = environment ? envs.filter(([e]) => e === environment) : envs;
  const anyOn = relevant.some(([, on]) => on);
  if (status === ('enabled' satisfies FlagStatusFilter)) return anyOn;
  if (status === ('disabled' satisfies FlagStatusFilter)) return !anyOn;
  return true;
}

export function clampRollout(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}
