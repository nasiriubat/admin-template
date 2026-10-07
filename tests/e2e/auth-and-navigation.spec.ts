import { expect, test, type Page } from '@playwright/test';

async function signIn(page: Page, email = 'admin@example.com') {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: false }).first().fill('correct-horse-battery');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/');
}

test.describe('authentication', () => {
  test('redirects signed-out visitors to login and back after signing in', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL(/\/login\?next=%2Fusers/);
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').first().fill('correct-horse-battery');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/users');
    await expect(page.getByRole('heading', { name: 'Users', level: 1 })).toBeVisible();
  });

  test('rejects bad credentials with an inline message', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').first().fill('short');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'incorrect' })).toBeVisible();
  });

  test('ignores open-redirect targets', async ({ page }) => {
    await page.goto('/login?next=//evil.example');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').first().fill('correct-horse-battery');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/');
  });

  test('logs out from the account menu', async ({ page }) => {
    await signIn(page);
    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('permissions', () => {
  test('viewers only see permitted navigation and get an unauthorized state on guarded routes', async ({ page, isMobile }) => {
    await signIn(page, 'viewer@example.com');
    if (!isMobile) {
      const nav = page.getByRole('navigation', { name: 'Main' });
      await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Users' })).toHaveCount(0);
    }
    await page.goto('/users');
    await expect(page.getByText('don’t have access')).toBeVisible();
  });
});

test.describe('shell', () => {
  test('desktop: persistent sidebar, breadcrumb below top bar, command palette', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop only');
    await signIn(page);
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
    await page.keyboard.press('Control+k');
    await page.getByPlaceholder('Search pages and actions…').fill('audit');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/audit');
  });

  test('mobile: bottom navigation and the More drawer stay open', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');
    await signIn(page);
    const bar = page.getByRole('navigation', { name: 'Primary mobile' });
    await expect(bar).toBeVisible();
    await bar.getByRole('button', { name: 'More' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.waitForTimeout(500);
    await expect(page.getByRole('dialog')).toBeVisible(); // regression: the drawer used to close itself
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('theme toggle switches dark mode and persists across reloads', async ({ page }) => {
    await signIn(page);
    await page.getByRole('button', { name: /switch to dark mode/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
  });

  test('unknown routes show the not-found page', async ({ page }) => {
    await signIn(page);
    await page.goto('/does-not-exist');
    await expect(page.getByText('Page not found')).toBeVisible();
  });
});
