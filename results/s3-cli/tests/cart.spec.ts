import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';

test.describe('cart', () => {
  let inventory: InventoryPage;
  let cart: CartPage;

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    inventory = new InventoryPage(page);
    cart = new CartPage(page);

    await login.goto();
    await login.login('standard_user');
    await inventory.addToCart('sauce-labs-backpack');
    await inventory.addToCart('sauce-labs-bike-light');
  });

  test('add two items, badge and cart contents match', async () => {
    await expect(inventory.cartBadge).toHaveText('2');

    await inventory.openCart();
    await expect(cart.title).toHaveText('Your Cart');
    await expect(cart.itemNames).toHaveText(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
  });

  test('remove one item, badge and contents update', async () => {
    await inventory.openCart();
    await cart.remove('sauce-labs-backpack');

    await expect(cart.cartBadge).toHaveText('1');
    await expect(cart.itemNames).toHaveText(['Sauce Labs Bike Light']);
  });
});
