import { test, expect } from '@playwright/test';

test('user can register, create a post, and see it listed', async ({ page }) => {
  const uniqueId = Date.now();
  const username = `e2euser${uniqueId}`;
  const postTitle = `E2E Test Post ${uniqueId}`;

  // 1. Register a fresh user
  await page.goto('/register');
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Email').fill(`${username}@example.com`);
  await page.getByPlaceholder('Password').fill('testpass123');
  await page.getByRole('button', { name: /register/i }).click();

  // Registration should redirect to home, logged in
  await expect(page).toHaveURL('/');
  await expect(page.getByText(username)).toBeVisible();

  // 2. Create a post
  await page.getByRole('link', { name: /new post/i }).click();
  await expect(page).toHaveURL('/posts/new');

  await page.getByPlaceholder('Title').fill(postTitle);
  await page.getByPlaceholder('Content').fill('This post was created by an automated E2E test.');
  await page.getByRole('button', { name: /publish/i }).click();

  // Should navigate to the new post's detail page
  await expect(page.getByRole('heading', { name: postTitle })).toBeVisible();

  // 3. Go home and confirm the post is listed
  await page.getByRole('link', { name: /knowledge hub/i }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByText(postTitle)).toBeVisible();
});