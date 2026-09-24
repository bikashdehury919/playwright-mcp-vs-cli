import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';

test.describe('cart', () => {
  let inventory: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('standard_user');
    inventory = new InventoryPage(page);
    await inventory.addToCart(BACKPACK);
    await inventory.addToCart(BIKE_LIGHT);
  });

  test('add two items, badge and cart contents match', async ({ page }) => {
    await expect(inventory.cartBadge).toHaveText('2');

    await inventory.openCart();
    const cart = new CartPage(page);
    await expect(cart.title).toHaveText('Your Cart');
    await expect(cart.itemNames).toHaveText([BACKPACK, BIKE_LIGHT]);
  });

  test('remove one item, badge and contents update', async ({ page }) => {
    await inventory.openCart();
    const cart = new CartPage(page);
    await cart.remove(BACKPACK);

    await expect(cart.cartBadge).toHaveText('1');
    await expect(cart.itemNames).toHaveText([BIKE_LIGHT]);
  });
});
