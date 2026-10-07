import type { AppConfig } from './app-config';

/** A permission id such as `users.view`. `*` and `users.*` act as wildcards when granted. */
export type PermissionId = string;

export interface PermissionDefinition {
  id: PermissionId;
  label: string;
  description?: string;
}

export interface ModuleNavItem {
  id: string;
  label: string;
  href: string;
  /** Lucide icon name registered in the shared IconRenderer. */
  icon: string;
  /** Navigation group id; see {@link NAV_GROUPS}. */
  group: NavGroupId;
  /** Sort order inside the group (lower first). */
  order?: number;
  /** Permission required to see this entry. Omit for "any signed-in user". */
  permission?: PermissionId;
  /** Show on the mobile bottom bar (the first four by `order` win). */
  mobilePrimary?: boolean;
  badge?: { text: string; variant?: 'primary' | 'success' | 'warning' | 'neutral' };
}

export interface ModuleRoute {
  path: string;
  title: string;
  permission?: PermissionId;
}

export interface ModuleSettingDefinition {
  key: string;
  label: string;
  description?: string;
  type: 'boolean' | 'string' | 'number';
  default: boolean | string | number;
}

export interface ModuleDefinition {
  /** Matches the key in `AppConfig.modules` for optional modules. */
  id: string;
  title: string;
  icon: string;
  /** Core modules are always enabled. */
  core?: boolean;
  navigation: ModuleNavItem[];
  /** Routes owned by the module, used for breadcrumbs and route guards. */
  routes: ModuleRoute[];
  permissions: PermissionDefinition[];
  /** Feature flags the module reads at runtime. */
  featureFlags?: string[];
  settings?: ModuleSettingDefinition[];
  /** Names of the API services (endpoint families) the module talks to. */
  apiServices?: string[];
}

export function defineModule(definition: ModuleDefinition): ModuleDefinition {
  return definition;
}

export const NAV_GROUPS = [
  { id: 'overview', title: 'Overview', order: 0 },
  { id: 'administration', title: 'Administration', order: 1 },
  { id: 'operations', title: 'Operations', order: 2 },
  { id: 'ai', title: 'AI & Knowledge', order: 3 },
  { id: 'developers', title: 'Developers', order: 4 },
  { id: 'system', title: 'System', order: 5 },
] as const;

export type NavGroupId = (typeof NAV_GROUPS)[number]['id'];

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: ModuleNavItem['badge'];
  moduleId: string;
  mobilePrimary?: boolean;
}

export interface NavGroupConfig {
  id: string;
  title: string;
  items: NavItemConfig[];
}

export function isModuleEnabled(mod: ModuleDefinition, enabled: AppConfig['modules']): boolean {
  if (mod.core) return true;
  return Boolean((enabled as Record<string, boolean>)[mod.id]);
}

/**
 * Compute whether a granted permission list satisfies a requirement. Supports `*` and
 * `resource.*` wildcards. This is a UX helper only; the backend must enforce authorization.
 */
export function hasPermission(granted: readonly PermissionId[], required?: PermissionId): boolean {
  if (!required) return true;
  if (granted.includes('*') || granted.includes(required)) return true;
  const dot = required.indexOf('.');
  return dot > 0 && granted.includes(`${required.slice(0, dot)}.*`);
}

export interface BuildNavigationOptions {
  modules: readonly ModuleDefinition[];
  enabled: AppConfig['modules'];
  permissions: readonly PermissionId[];
}

/** Build the sidebar groups from enabled modules the current user may access. */
export function buildNavigation({ modules, enabled, permissions }: BuildNavigationOptions): NavGroupConfig[] {
  const buckets = new Map<string, Array<NavItemConfig & { order: number }>>();
  for (const mod of modules) {
    if (!isModuleEnabled(mod, enabled)) continue;
    for (const item of mod.navigation) {
      if (!hasPermission(permissions, item.permission)) continue;
      const list = buckets.get(item.group) ?? [];
      list.push({
        id: item.id,
        label: item.label,
        href: item.href,
        icon: item.icon,
        badge: item.badge,
        moduleId: mod.id,
        mobilePrimary: item.mobilePrimary,
        order: item.order ?? 100,
      });
      buckets.set(item.group, list);
    }
  }
  return NAV_GROUPS.flatMap((group) => {
    const items = buckets.get(group.id);
    if (!items?.length) return [];
    items.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
    return [{ id: group.id, title: group.title, items: items.map(({ order: _order, ...rest }) => rest) }];
  });
}

/** Items shown on the mobile bottom bar (max four; the fifth slot is the "More" menu). */
export function pickMobileItems(groups: readonly NavGroupConfig[], limit = 4): NavItemConfig[] {
  return groups.flatMap((g) => g.items).filter((item) => item.mobilePrimary).slice(0, limit);
}

/** True when `pathname` is the nav item's route or a child of it (segment-aware). */
export function isRouteActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export interface BreadcrumbCrumb {
  label: string;
  href?: string;
}

/**
 * Resolve breadcrumbs for a pathname from module metadata, falling back to the humanised URL
 * segments for dynamic routes such as `/users/123`.
 */
export function resolveBreadcrumbs(pathname: string, modules: readonly ModuleDefinition[]): BreadcrumbCrumb[] {
  const crumbs: BreadcrumbCrumb[] = [{ label: 'Home', href: '/' }];
  if (pathname === '/') return [{ label: 'Dashboard' }];

  const items = modules.flatMap((m) => m.navigation);
  const routes = modules.flatMap((m) => m.routes);
  const segments = pathname.split('/').filter(Boolean);
  let path = '';
  segments.forEach((segment, index) => {
    path += `/${segment}`;
    const isLast = index === segments.length - 1;
    const nav = items.find((i) => i.href === path);
    const route = routes.find((r) => r.path === path);
    const label =
      nav?.label ?? route?.title ?? segment.replace(/[-_]/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
    // Only link intermediate segments that are real pages; otherwise (e.g. /ai) show plain text.
    crumbs.push(isLast || !(nav || route) ? { label } : { label, href: path });
  });
  return crumbs;
}

export interface RouteMatch {
  module: ModuleDefinition;
  route: ModuleRoute;
}

/**
 * Find the module route owning `pathname`. Dynamic segments such as `/users/[id]` match any
 * single segment. The most specific (longest) route wins.
 */
export function matchRoute(pathname: string, modules: readonly ModuleDefinition[]): RouteMatch | null {
  const parts = pathname.split('/').filter(Boolean);
  let best: (RouteMatch & { score: number }) | null = null;
  for (const mod of modules) {
    for (const route of mod.routes) {
      const routeParts = route.path.split('/').filter(Boolean);
      if (routeParts.length > parts.length) continue;
      const isExact = routeParts.length === parts.length;
      const matches = routeParts.every((seg, i) => (seg.startsWith('[') && seg.endsWith(']') ? true : seg === parts[i]));
      // Child paths (e.g. /users/123/edit) inherit the parent route; the root route only matches "/".
      if (!matches || (routeParts.length === 0 && parts.length > 0) || (!isExact && routeParts.length === 0)) continue;
      const score = routeParts.length * 2 + (isExact ? 1 : 0);
      if (!best || score > best.score) best = { module: mod, route, score };
    }
  }
  return best ? { module: best.module, route: best.route } : null;
}

/** Only allow same-origin relative redirect targets (blocks open-redirects such as `//evil.com`). */
export function safeRedirectPath(target: string | null | undefined, fallback = '/'): string {
  if (!target || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return fallback;
  try {
    const url = new URL(target, 'http://localhost');
    return url.origin === 'http://localhost' ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}
