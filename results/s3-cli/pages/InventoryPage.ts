import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly items: Locator;
  readonly itemNames: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
  }

  /** slug is the product id used in data-test, e.g. "sauce-labs-backpack" */
  async addToCart(slug: string) {
    await this.page.getByTestId(`add-to-cart-${slug}`).click();
  }
}
