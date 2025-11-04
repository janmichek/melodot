import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForElement(selector: string, options?: { timeout?: number }) {
    await this.page.waitForSelector(selector, options);
  }

  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  async isElementVisible(locator: Locator, timeout: number = 5000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async getTextContent(locator: Locator): Promise<string> {
    return (await locator.textContent()) || '';
  }

  async clickAndWait(locator: Locator, waitTime?: number) {
    await locator.click();
    if (waitTime) {
      await this.page.waitForTimeout(waitTime);
    }
  }
}