import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const BASE = 'http://localhost:3200';
const ROUTES = ['/', '/ai', '/enterprise', '/playful', '/product', '/templates', '/pricing', '/features', '/about', '/customers', '/contact', '/changelog', '/blog', '/docs', '/privacy', '/terms'];

async function open(page: Page, route: string, mode: 'light' | 'dark') {
  await page.emulateMedia({ colorScheme: mode });
  await page.goto(BASE + route);
  await page.evaluate((m) => localStorage.setItem('nexus_theme_preferences', JSON.stringify({ mode: m })), mode);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
}

for (const mode of ['light', 'dark'] as const) {
  // 1) Motion ON: the animated experience must not throw, log errors or cause horizontal scroll.
  test.describe(`animated pages (${mode})`, () => {
    test.use({ reducedMotion: 'no-preference' });
    for (const route of ROUTES) {
      test(`marketing ${route} runs cleanly with motion`, async ({ page }) => {
        const problems: string[] = [];
        page.on('pageerror', (e) => problems.push(e.message));
        page.on('console', (m) => m.type() === 'error' && problems.push(m.text()));
        await open(page, route, mode);
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < height; y += 600) {
          await page.evaluate((v) => window.scrollTo(0, v), y);
          await page.waitForTimeout(60);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 'horizontal overflow').toBeLessThanOrEqual(1);
        expect(problems).toEqual([]);
      });
    }
  });

  // 2) Motion OFF (prefers-reduced-motion): everything must be fully visible, readable and WCAG 2.2 AA clean.
  test.describe(`accessibility with reduced motion (${mode})`, () => {
    test.use({ reducedMotion: 'reduce' });
    for (const route of ROUTES) {
      test(`marketing ${route} is accessible`, async ({ page }) => {
        await open(page, route, mode);
        await page.waitForTimeout(300);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
        expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
      });
    }
  });
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

test('template switcher lists all five templates and navigates', async ({ page }) => {
  await page.goto(BASE + '/');
  await page.getByRole('button', { name: /Templates/ }).click();
  for (const name of ['Aurora', 'Neon', 'Editorial', 'Playful', 'Product']) await expect(page.getByRole('link', { name: new RegExp(name) }).first()).toBeVisible();
  await page.getByRole('link', { name: /Neon/ }).first().click();
  await expect(page).toHaveURL(/\/ai$/);
});
