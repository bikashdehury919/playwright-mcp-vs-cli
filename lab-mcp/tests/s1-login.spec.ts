import { test, expect } from '@playwright/test';

test('standard user can log in', async ({ page }) => {
  await page.goto('/');
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-btn').click();
  await expect(page.locator('.title')).toHaveText('Products');
});

test('adding the backpack updates the cart badge', async ({ page }) => {
  await page.goto('/');
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();
  await page.locator('[data-test="add-to-cart-backpack"]').click();
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});