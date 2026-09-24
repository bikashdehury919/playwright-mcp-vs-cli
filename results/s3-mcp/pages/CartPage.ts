import { type Locator, type Page } from '@playwright/test';
import { BasePage, exactText } from './BasePage';

export class CartPage extends BasePage {
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async remove(name: string) {
    await this.items
      .filter({ has: this.itemNames.filter({ hasText: exactText(name) }) })
      .getByRole('button', { name: 'Remove' })
      .click();
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
