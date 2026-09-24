import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';

test.describe('login', () => {
  test('standard_user logs in and sees the product list', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('standard_user');

    const inventory = new InventoryPage(page);
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventory.title).toHaveText('Products');
    await expect(inventory.items).toHaveCount(6);
  });

  test('locked_out_user sees the locked-out error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('locked_out_user');

    await expect(login.error).toHaveText('Epic sadface: Sorry, this user has been locked out.');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });
});
