import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DonationPage extends BasePage {
  readonly donationForm: Locator;
  readonly donationTitle: Locator;
  readonly artistIdLabel: Locator;
  readonly amountButtons: Locator;
  readonly donatingButton: Locator;
  readonly txHash: Locator;
  readonly successMessage: Locator;
  readonly pendingStatus: Locator;
  readonly errorBox: Locator;
  readonly contractFooter: Locator;

  constructor(page: Page) {
    super(page);
    this.donationForm = page.locator('.contract-form-section, [class*="donation"]');
    this.donationTitle = page.locator('h3:has-text("Donate to Artist")');
    this.artistIdLabel = page.locator('.form-label:has-text("Artist ID")');
    this.amountButtons = page.locator('.btn-amount-selector');
    this.donatingButton = page.locator('button:has-text("Donating...")');
    this.txHash = page.locator('.tx-hash');
    this.successMessage = page.locator('.tx-status-success, p:has-text("Donation successful")');
    this.pendingStatus = page.locator('.tx-status-pending, p:has-text("Waiting for confirmation")');
    this.errorBox = page.locator('.error-box');
    this.contractFooter = page.locator('.contract-footer, [class*="contract"]');
  }

  async isDonationFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.donationForm);
  }

  async verifyDonationFormVisible() {
    await expect(this.donationForm).toBeVisible({ timeout: 10000 });
  }

  async verifyDonationFormHidden() {
    await expect(this.donationForm).not.toBeVisible();
  }

  async getAmountButtonsCount(): Promise<number> {
    return await this.amountButtons.count();
  }

  async verifyAmountButtons() {
    await expect(this.amountButtons).toHaveCount(3);
  }

  async selectDonationAmount(index: number = 0) {
    await this.amountButtons.nth(index).click();
  }

  async getDonationAmounts(): Promise<string[]> {
    const count = await this.getAmountButtonsCount();
    const amounts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await this.getTextContent(this.amountButtons.nth(i));
      amounts.push(text);
    }
    return amounts;
  }

  async isDonating(): Promise<boolean> {
    return await this.isElementVisible(this.donatingButton, 2000);
  }

  async isSuccessful(): Promise<boolean> {
    return await this.isElementVisible(this.successMessage, 5000);
  }

  async isPending(): Promise<boolean> {
    return await this.isElementVisible(this.pendingStatus, 2000);
  }

  async getTransactionHash(): Promise<string> {
    await expect(this.txHash).toBeVisible();
    return await this.getTextContent(this.txHash);
  }

  async verifySuccessMessage() {
    await expect(this.successMessage).toBeVisible({ timeout: 15000 });
  }

  async verifyErrorMessage() {
    await expect(this.errorBox).toBeVisible();
  }

  async areButtonsDisabled(): Promise<boolean> {
    const count = await this.getAmountButtonsCount();
    for (let i = 0; i < count; i++) {
      if (!(await this.amountButtons.nth(i).isDisabled())) {
        return false;
      }
    }
    return true;
  }
}