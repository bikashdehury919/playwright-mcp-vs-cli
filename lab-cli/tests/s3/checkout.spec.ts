import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutInfoPage } from '../../pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../../pages/CheckoutCompletePage';

test('complete checkout and see the confirmation', async ({ page }) => {
  const login = new LoginPage(page);
  const inventory = new InventoryPage(page);
  const cart = new CartPage(page);
  const info = new CheckoutInfoPage(page);
  const overview = new CheckoutOverviewPage(page);
  const complete = new CheckoutCompletePage(page);

  await login.goto();
  await login.login('standard_user');
  await inventory.addToCart('sauce-labs-backpack');
  await inventory.openCart();
  await cart.checkout();

  await expect(info.title).toHaveText('Checkout: Your Information');
  await info.fillAndContinue('Test', 'User', '12345');

  await expect(overview.title).toHaveText('Checkout: Overview');
  await expect(overview.itemNames).toHaveText(['Sauce Labs Backpack']);
  await overview.finish();

  await expect(page).toHaveURL(/checkout-complete\.html/);
  await expect(complete.title).toHaveText('Checkout: Complete!');
  await expect(complete.header).toHaveText('Thank you for your order!');
  await expect(complete.cartBadge).toBeHidden();
});
