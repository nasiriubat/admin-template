import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const BASE = 'http://localhost:3200';
const ROUTES = ['/', '/ai', '/enterprise', '/pricing', '/features', '/about', '/customers', '/contact', '/changelog', '/blog', '/blog/' , '/docs', '/privacy', '/terms'].filter((r) => !r.endsWith('/') || r === '/');

for (const mode of ['light', 'dark'] as const) {
  for (const route of ROUTES) {
    test(`marketing ${route} is accessible and stable (${mode})`, async ({ page }) => {
      const problems: string[] = [];
      page.on('pageerror', (e) => problems.push(e.message));
      page.on('console', (m) => m.type() === 'error' && problems.push(m.text()));
      await page.emulateMedia({ colorScheme: mode });
      await page.goto(BASE + route);
      await page.evaluate((m) => localStorage.setItem('nexus_theme_preferences', JSON.stringify({ mode: m })), mode);
      await page.reload();
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 'horizontal overflow').toBeLessThanOrEqual(1);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
      expect(problems).toEqual([]);
    });
  }
}

test('pricing toggle switches billing period and the contact form validates', async ({ page }) => {
  await page.goto(BASE + '/pricing');
  const toggle = page.getByRole('switch').first();
  const before = await toggle.getAttribute('aria-checked');
  await toggle.click();
  expect(await toggle.getAttribute('aria-checked')).not.toBe(before);
  await page.goto(BASE + '/contact');
  await page.getByRole('button', { name: /send|submit/i }).click();
  await expect(page.getByRole('alert').first()).toBeVisible();
});
