import {expect, Locator, Page} from '@playwright/test';
import {BasePage} from './BasePage';

export class WalletPage extends BasePage {
  readonly connectButton: Locator;
  readonly disconnectButton: Locator;
  readonly headerAddress: Locator;
  readonly headerBalance: Locator;
  readonly chainBadge: Locator;
  readonly faucetLink: Locator;

  constructor(page: Page) {
    super(page);
    this.connectButton = page.locator('button', { hasText: 'Connect' });
    this.disconnectButton = page.locator('.header-disconnect-btn');
    this.headerAddress = page.locator('.header-address');
    this.headerBalance = page.locator('.header-balance');
    this.chainBadge = page.locator('.header-chain-badge');
    this.faucetLink = page.locator('.header-faucet-link');
  }

  async isWalletConnected(): Promise<boolean> {
    return await this.isElementVisible(this.headerAddress);
  }

  async connect() {
    await expect(this.connectButton).toBeEnabled({ timeout: 10000 });
    await this.connectButton.click();
    // Wait for Web3Auth modal
    await this.page.waitForTimeout(2000);
  }

  async disconnect() {
    if (await this.isWalletConnected()) {
      await this.disconnectButton.click();
      await expect(this.connectButton).toBeVisible({ timeout: 5000 });
    }
  }

  async getWalletAddress(): Promise<string> {
    return await this.getTextContent(this.headerAddress);
  }

  async getBalance(): Promise<string> {
    return await this.getTextContent(this.headerBalance);
  }

  async getChainName(): Promise<string> {
    return await this.getTextContent(this.chainBadge);
  }

  async verifyWalletConnected() {
    await expect(this.headerAddress).toBeVisible();
    await expect(this.headerBalance).toBeVisible();
    await expect(this.disconnectButton).toBeVisible();
  }

  async verifyWalletDisconnected() {
    await expect(this.connectButton).toBeVisible();
  }
}
