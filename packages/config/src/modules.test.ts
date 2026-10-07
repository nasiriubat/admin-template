import { describe, expect, it } from 'vitest';
import { defaultAppConfig } from './app-config';
import {
  buildNavigation,
  defineModule,
  hasPermission,
  isRouteActive,
  matchRoute,
  pickMobileItems,
  resolveBreadcrumbs,
  safeRedirectPath,
} from './modules';

const users = defineModule({
  id: 'users', title: 'Users', icon: 'Users',
  navigation: [{ id: 'users', label: 'Users', href: '/users', icon: 'Users', group: 'administration', order: 0, permission: 'users.view', mobilePrimary: true }],
  routes: [{ path: '/users', title: 'Users', permission: 'users.view' }, { path: '/users/[id]', title: 'User details', permission: 'users.view' }],
  permissions: [],
});
const home = defineModule({
  id: 'dashboard', title: 'Dashboard', icon: 'LayoutDashboard', core: true,
  navigation: [{ id: 'home', label: 'Dashboard', href: '/', icon: 'LayoutDashboard', group: 'overview', order: 0, mobilePrimary: true }],
  routes: [{ path: '/', title: 'Dashboard' }],
  permissions: [],
});
const billing = defineModule({
  id: 'billing', title: 'Billing', icon: 'CreditCard',
  navigation: [{ id: 'billing', label: 'Billing', href: '/billing', icon: 'CreditCard', group: 'system' }],
  routes: [{ path: '/billing', title: 'Billing' }],
  permissions: [],
});
const modules = [home, users, billing];

describe('hasPermission', () => {
  it('supports exact, resource wildcard and global wildcard grants', () => {
    expect(hasPermission(['users.view'], 'users.view')).toBe(true);
    expect(hasPermission(['users.*'], 'users.manage')).toBe(true);
    expect(hasPermission(['*'], 'anything.at.all')).toBe(true);
    expect(hasPermission(['users.view'], 'users.manage')).toBe(false);
    expect(hasPermission([], undefined)).toBe(true);
    expect(hasPermission(['usersx.*'], 'users.view')).toBe(false);
  });
});

describe('buildNavigation', () => {
  it('hides disabled modules and entries the user lacks permission for', () => {
    const off = { ...defaultAppConfig.modules, billing: false };
    const groups = buildNavigation({ modules, enabled: off, permissions: ['users.view'] });
    expect(groups.flatMap((g) => g.items.map((i) => i.id))).toEqual(['home', 'users']);
    const none = buildNavigation({ modules, enabled: off, permissions: [] });
    expect(none.flatMap((g) => g.items.map((i) => i.id))).toEqual(['home']);
  });
  it('enables optional modules from config and keeps group order', () => {
    const groups = buildNavigation({ modules, enabled: { ...defaultAppConfig.modules, billing: true }, permissions: ['*'] });
    expect(groups.map((g) => g.id)).toEqual(['overview', 'administration', 'system']);
  });
  it('limits the mobile bar to four primary items', () => {
    const groups = buildNavigation({ modules, enabled: defaultAppConfig.modules, permissions: ['*'] });
    expect(pickMobileItems(groups).map((i) => i.id)).toEqual(['home', 'users']);
    expect(pickMobileItems(groups, 1)).toHaveLength(1);
  });
});

describe('routing helpers', () => {
  it('matches active routes by segment, not prefix', () => {
    expect(isRouteActive('/users/42', '/users')).toBe(true);
    expect(isRouteActive('/users-archive', '/users')).toBe(false);
    expect(isRouteActive('/anything', '/')).toBe(false);
  });
  it('matches dynamic routes and prefers the most specific one', () => {
    expect(matchRoute('/users/42', modules)?.route.path).toBe('/users/[id]');
    expect(matchRoute('/users', modules)?.route.path).toBe('/users');
    expect(matchRoute('/users/42/edit', modules)?.route.path).toBe('/users/[id]');
    expect(matchRoute('/', modules)?.module.id).toBe('dashboard');
    expect(matchRoute('/nope', modules)).toBeNull();
  });
  it('does not link intermediate segments that have no page', () => {
    const nested = defineModule({ id: 'ai', title: 'AI', icon: 'Sparkles', navigation: [], routes: [{ path: '/ai/models', title: 'Models' }], permissions: [] });
    expect(resolveBreadcrumbs('/ai/models', [nested])).toEqual([{ label: 'Home', href: '/' }, { label: 'Ai' }, { label: 'Models' }]);
  });
  it('builds breadcrumbs from metadata with a humanised fallback', () => {
    expect(resolveBreadcrumbs('/users/ada-lovelace', modules)).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Users', href: '/users' },
      { label: 'Ada lovelace' },
    ]);
    expect(resolveBreadcrumbs('/', modules)).toEqual([{ label: 'Dashboard' }]);
  });
});

describe('safeRedirectPath', () => {
  it.each([
    ['/users?tab=a#x', '/users?tab=a#x'],
    ['//evil.com', '/'],
    ['https://evil.com', '/'],
    ['/\\evil.com', '/'],
    ['javascript:alert(1)', '/'],
    [null, '/'],
    ['', '/'],
  ])('%s -> %s', (input, expected) => {
    expect(safeRedirectPath(input as string | null)).toBe(expected);
  });
});
