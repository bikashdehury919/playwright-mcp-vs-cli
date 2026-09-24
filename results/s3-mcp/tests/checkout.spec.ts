import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutInfoPage } from '../../pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../../pages/CheckoutCompletePage';

test('complete checkout and see the confirmation', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login('standard_user');

  const inventory = new InventoryPage(page);
  await inventory.addToCart('Sauce Labs Backpack');
  await inventory.addToCart('Sauce Labs Bike Light');
  await inventory.openCart();

  await new CartPage(page).checkout();
  await new CheckoutInfoPage(page).fillAndContinue('Test', 'User', '12345');

  const overview = new CheckoutOverviewPage(page);
  await expect(overview.title).toHaveText('Checkout: Overview');
  await expect(overview.itemNames).toHaveText(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
  await expect(overview.total).toHaveText('Total: $43.18');
  await overview.finish();

  const complete = new CheckoutCompletePage(page);
  await expect(page).toHaveURL(/checkout-complete\.html/);
  await expect(complete.title).toHaveText('Checkout: Complete!');
  await expect(complete.header).toHaveText('Thank you for your order!');
  await expect(complete.cartBadge).toHaveCount(0);
});
