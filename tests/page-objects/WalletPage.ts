import {expect, Locator, Page} from '@playwright/test';
import {BasePage} from './BasePage';

export class WalletPage extends BasePage {
  readonly connectButton: Locator;
  readonly signOutButton: Locator;
  readonly userMenuTrigger: Locator;
  readonly userAddress: Locator;
  readonly userBalance: Locator;
  readonly networkInfo: Locator;
  readonly faucetLink: Locator;

  constructor(page: Page) {
    super(page);
    this.connectButton = page.locator('button:has-text("Sign In")');
    this.signOutButton = page.getByRole('menuitem', { name: /sign out/i });
    this.userMenuTrigger = page.locator('[data-slot="trigger"]').filter({ has: page.locator('div[class*="jazzicon"]') }).or(page.locator('button').filter({ has: page.locator('div[class*="rounded"]') }));
    this.userAddress = page.locator('.truncate.font-medium');
    this.userBalance = page.locator('.truncate.text-xs.text-muted-foreground');
    this.networkInfo = page.getByText(/Passet Hub|Ethereum|Unknown/);
    this.faucetLink = page.getByRole('menuitem', { name: /get test tokens/i });
  }

  async isWalletConnected(): Promise<boolean> {
    return await this.isElementVisible(this.userAddress);
  }

  async connect() {
    await expect(this.connectButton).toBeEnabled({ timeout: 10000 });
    await this.connectButton.click();
    // Wait for Web3Auth modal
    await this.page.waitForTimeout(2000);
  }

  async disconnect() {
    if (await this.isWalletConnected()) {
      await this.userMenuTrigger.click();
      await this.signOutButton.click();
      await expect(this.connectButton).toBeVisible({ timeout: 5000 });
    }
  }

  async getWalletAddress(): Promise<string> {
    return await this.getTextContent(this.userAddress);
  }

  async getBalance(): Promise<string> {
    return await this.getTextContent(this.userBalance);
  }

  async getChainName(): Promise<string> {
    await this.userMenuTrigger.click();
    return await this.getTextContent(this.networkInfo);
  }

  async verifyWalletConnected() {
    await expect(this.userAddress).toBeVisible();
    await expect(this.userBalance).toBeVisible();
  }

  async verifyWalletDisconnected() {
    await expect(this.connectButton).toBeVisible();
  }
}
