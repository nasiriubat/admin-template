import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = [
  '/', '/analytics', '/users', '/users/u-001', '/roles', '/audit', '/health', '/logs', '/jobs', '/files',
  '/feature-flags', '/api-keys', '/webhooks', '/settings', '/theme-editor', '/notifications', '/profile',
  '/ai/providers', '/ai/models', '/ai/prompts', '/ai/usage', '/knowledge/documents', '/knowledge/sources', '/billing',
  '/workflows', '/workflows/runs', '/workflows/wf-001', '/examples/components', '/examples/wizard', '/examples/detail', '/examples/crud', '/examples/settings-layout',
];

test.beforeEach(async ({ page, context }) => {
  await context.addCookies([{ name: 'nexus_session', value: 'u-demo-admin', url: 'http://localhost:3000' }]);
  await page.goto('/');
});

for (const mode of ['light', 'dark'] as const) {
  for (const route of ROUTES) {
    test(`${route} renders cleanly (${mode})`, async ({ page }) => {
      const problems: string[] = [];
      page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
      page.on('console', (m) => {
        if (m.type() === 'error') problems.push(`console: ${m.text()}`);
      });
      await page.emulateMedia({ colorScheme: mode });
      await page.evaluate((m) => localStorage.setItem('nexus_theme_preferences', JSON.stringify({ mode: m })), mode);
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      // Let queries settle: no skeleton/busy regions left.
      // The component gallery intentionally shows loading skeletons.
      if (route !== '/examples/components') await expect(page.locator('main [aria-busy="true"]')).toHaveCount(0, { timeout: 10_000 });

      // No horizontal page scroll (mobile quality checklist).
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, 'horizontal overflow').toBeLessThanOrEqual(1);

      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
      expect(problems).toEqual([]);
    });
  }
}
