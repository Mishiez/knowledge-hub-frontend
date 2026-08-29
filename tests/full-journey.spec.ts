import { test, expect } from '@playwright/test';

test('user can register, create a post, and see it listed', async ({ page }) => {
  const uniqueId = Date.now();
  const username = `e2euser${uniqueId}`;
  const postTitle = `E2E Test Post ${uniqueId}`;

  await page.goto('/register');
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Email').fill(`${username}@example.com`);
  await page.getByPlaceholder('Password').fill('testpass123');
  await page.getByRole('button', { name: /register/i }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByText(username)).toBeVisible();

  await page.getByRole('link', { name: /new post/i }).click();
  await expect(page).toHaveURL('/posts/new');

  await page.getByPlaceholder('Title').fill(postTitle);
  await page.getByPlaceholder('Content').fill('This post was created by an automated E2E test.');
  await page.getByRole('button', { name: /publish/i }).click();

  await expect(page.getByRole('heading', { name: postTitle })).toBeVisible();

  await page.getByRole('link', { name: /knowledge hub/i }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByText(postTitle)).toBeVisible();
});
