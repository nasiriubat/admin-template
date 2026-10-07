import { expect, test } from '@playwright/test';

// Regression: leaving the Analytics page used to freeze the tab ("Page unresponsive") because the
// client-mode DataTable re-rendered endlessly. Click through every sidebar link like a user would.
test('clicking through every sidebar link never freezes the page', async ({ page, isMobile }) => {
  test.skip(isMobile, 'sidebar is desktop only; mobile uses the drawer');
  test.setTimeout(120_000);
  await page.context().addCookies([{ name: 'nexus_session', value: 'u-demo-admin', url: 'http://localhost:3000' }]);
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav).toBeVisible();
  const hrefs = await nav.getByRole('link').evaluateAll((els) => els.map((e) => e.getAttribute('href') as string));
  expect(hrefs.length).toBeGreaterThan(15);

  for (let round = 0; round < 2; round++) {
    for (const href of hrefs) {
      await nav.locator(`a[href="${href}"]`).click();
      await expect(page).toHaveURL(href === '/' ? /\/$/ : new RegExp(`${href}$`));
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      // Give data a moment to arrive, then prove the main thread still responds.
      await page.waitForTimeout(700);
      const responsive = await Promise.race([page.evaluate(() => true), new Promise<boolean>((r) => setTimeout(() => r(false), 3000))]);
      expect(responsive, `page froze on ${href}`).toBe(true);
    }
  }
});

test('content sits on a surface panel and uses the full window width', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop layout check');
  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.context().addCookies([{ name: 'nexus_session', value: 'u-demo-admin', url: 'http://localhost:3000' }]);
  await page.goto('/users');
  const panel = page.locator('#main-content > div');
  const box = await panel.boundingBox();
  const main = await page.locator('#main-content').boundingBox();
  expect(box!.width).toBeGreaterThan(main!.width - 40); // only the small gutter remains
  const bg = await panel.evaluate((el) => getComputedStyle(el).backgroundColor);
  const canvas = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).not.toBe(canvas); // surface is visually distinct from the canvas
});
