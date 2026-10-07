import { allModules } from '@nexus/features';
import { buildNavigation, isModuleEnabled, resolveBreadcrumbs } from '@nexus/config';
import { appConfig } from './app-config';

/** Modules switched on for this deployment (core modules are always included). */
export const enabledModules = allModules.filter((m) => isModuleEnabled(m, appConfig.modules));

export const navigationFor = (permissions: readonly string[]) =>
  buildNavigation({ modules: allModules, enabled: appConfig.modules, permissions });

export const breadcrumbsFor = (pathname: string) => resolveBreadcrumbs(pathname, enabledModules);
