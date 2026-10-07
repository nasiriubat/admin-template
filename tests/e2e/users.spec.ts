import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').first().fill('correct-horse-battery');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/');
  await page.goto('/users');
  await expect(page.getByRole('heading', { name: 'Users', level: 1 })).toBeVisible();
});

test('create, filter and delete a user with confirmation', async ({ page }) => {
  await page.getByRole('button', { name: 'Invite user' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Full name').fill('Playwright Person');
  await dialog.getByLabel('Email').fill('playwright.person@example.com');
  await dialog.getByRole('button', { name: 'Send invite' }).click();
  await expect(page.getByText('Invitation sent')).toBeVisible();

  await page.getByRole('searchbox').fill('playwright.person');
  await expect(page.getByText('Playwright Person').locator('visible=true').first()).toBeVisible();

  await page.getByRole('button', { name: 'Actions for Playwright Person' }).locator('visible=true').first().click();
  await page.getByRole('menuitem', { name: /delete/i }).click();
  const confirm = page.getByRole('alertdialog');
  await expect(confirm.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await confirm.getByRole('button', { name: 'Delete user' }).click();
  await expect(page.getByText('User deleted')).toBeVisible();
});

test('shows validation errors from the schema and the server', async ({ page }) => {
  await page.getByRole('button', { name: 'Invite user' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Send invite' }).click();
  await expect(dialog.getByText('Enter at least 2 characters.')).toBeVisible();
  await dialog.getByLabel('Full name').fill('Dup Licate');
  await dialog.getByLabel('Email').fill('avery.nguyen@example.com');
  await dialog.getByRole('button', { name: 'Send invite' }).click();
  await expect(dialog.getByText('A user with this email already exists.')).toBeVisible();
});

test('sorts and paginates', async ({ page, isMobile }) => {
  test.skip(isMobile, 'header sorting is desktop; mobile uses the sort select');
  await page.getByRole('columnheader', { name: /user/i }).getByRole('button').click();
  await expect(page.getByRole('columnheader', { name: /user/i })).toHaveAttribute('aria-sort', 'ascending');
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page.getByText(/Showing 11–20/)).toBeVisible();
});

test('mobile shows records instead of a squeezed table', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await expect(page.getByRole('table')).toBeHidden();
  await expect(page.getByRole('list', { name: 'Users' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Filters/ })).toBeVisible();
});
