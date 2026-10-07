import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.context().addCookies([{ name: 'nexus_session', value: 'u-demo-admin', url: 'http://localhost:3000' }]);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
});

test('floating assistant opens a quick-actions menu and can be moved without dragging', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Quick actions assistant' });
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.getByText('Quick actions')).toBeVisible();
  await page.getByRole('button', { name: 'Top left' }).click();
  const box = await trigger.boundingBox();
  expect(box!.x).toBeLessThan(40); // snapped to the left edge
  await page.keyboard.press('Escape');
  await expect(page.getByText('Quick actions')).toHaveCount(0);
});

test('assistant can be turned off and back on from the account menu, and the choice persists', async ({ page }) => {
  await page.getByRole('button', { name: 'Quick actions assistant' }).click();
  await page.getByRole('button', { name: /Hide assistant/ }).click();
  await expect(page.getByRole('button', { name: 'Quick actions assistant' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Quick actions assistant' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Floating assistant' }).click();
  await page.keyboard.press('Escape'); // the open menu hides the rest of the page from assistive tech
  await expect(page.getByRole('button', { name: 'Quick actions assistant' })).toBeVisible();
});

test('dragging the assistant snaps it to the nearest edge', async ({ page, isMobile }) => {
  test.skip(isMobile, 'pointer drag is exercised on desktop');
  const trigger = page.getByRole('button', { name: 'Quick actions assistant' });
  const b = (await trigger.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(120, 300, { steps: 8 });
  await page.mouse.up();
  const after = (await trigger.boundingBox())!;
  expect(after.x).toBeLessThan(40);
  await expect(page.getByText('Quick actions')).toHaveCount(0); // a drag must not also open the menu
});
