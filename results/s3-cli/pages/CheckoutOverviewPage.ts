import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutOverviewPage extends BasePage {
  readonly itemNames: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.itemNames = page.getByTestId('inventory-item-name');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
  }

  async finish() {
    await this.finishButton.click();
  }
}
