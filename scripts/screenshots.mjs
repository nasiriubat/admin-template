// Captures marketplace/README screenshots (desktop + mobile, light + dark) into docs/screenshots.
// Requires a running demo build: `NEXT_PUBLIC_DEMO_MODE=true pnpm build && pnpm start`.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const base = process.env.BASE_URL ?? 'http://localhost:3000';
const pages = [['dashboard', '/'], ['users', '/users'], ['roles', '/roles'], ['theme', '/theme-editor'], ['health', '/health']];
const out = 'docs/screenshots';
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
for (const [device, viewport, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
  for (const mode of ['light', 'dark']) {
    const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, colorScheme: mode, deviceScaleFactor: 1 });
    await context.addCookies([{ name: 'nexus_session', value: 'u-demo-admin', url: base }]);
    const page = await context.newPage();
    await page.goto(base);
    await page.evaluate((m) => localStorage.setItem('nexus_theme_preferences', JSON.stringify({ mode: m })), mode);
    for (const [name, route] of pages) {
      await page.goto(base + route);
      await page.getByRole('heading', { level: 1 }).first().waitFor();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${out}/${name}-${device}-${mode}.png` });
    }
    await context.close();
  }
}
await browser.close();
console.log(`Screenshots written to ${out}`);
