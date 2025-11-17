import {expect, Locator, Page} from '@playwright/test'
import {BasePage} from './BasePage'

export class DonationPage extends BasePage {
  readonly donationForm: Locator
  readonly donationTitle: Locator
  readonly artistIdLabel: Locator
  readonly amountButtons: Locator
  readonly donatingButton: Locator
  readonly txHash: Locator
  readonly successMessage: Locator
  readonly pendingStatus: Locator
  readonly errorBox: Locator
  readonly contractFooter: Locator

  constructor(page: Page) {
    super(page)
    // Donation form is now a div containing DonationArtistsControls, DonationAmountControls, DonationCalculation
    // Look for the parent div that contains donation controls
    this.donationForm = page.locator('div:has(label:has-text("Select donation amount per artist")):has(button:has-text(/\\d+ (PAS|ETH)/i)), div:has(label:has-text("Select artists to donate to"))').first()
    this.donationTitle = page.locator('h3:has-text("Donate"), label:has-text("Select donation amount per artist")').first()
    this.artistIdLabel = page.locator('label:has-text("Select artists to donate to")')
    // Amount buttons are now regular Button components with text like "1 PAS", "2 PAS", etc.
    this.amountButtons = page.locator('button:has-text(/\\d+ (PAS|ETH)/i)')
    this.donatingButton = page.locator('button:has-text(/Processing donations|Donating/i)')
    // Transaction hash is in the TxNotification component
    this.txHash = page.locator('[class*="tx"] a[href*="/tx/"], a[href*="/tx/"]')
    // Success message is in TxNotification with isSuccess=true, shows "Donated X PAS to Y artist(s)!"
    this.successMessage = page.locator('[role="alert"]:has-text(/Donated|successful/i), div:has-text(/Donated.*PAS/i)')
    this.pendingStatus = page.locator('[role="alert"]:has-text(/Processing|Waiting/i), div:has-text(/Processing donations/i)')
    this.errorBox = page.locator('[role="alert"][class*="destructive"], .error-box')
    this.contractFooter = page.locator('.contract-footer, [class*="contract"]')
  }

  async isDonationFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.donationForm)
  }

  async verifyDonationFormVisible() {
    await expect(this.donationForm).toBeVisible({timeout: 10000})
  }

  async verifyDonationFormHidden() {
    await expect(this.donationForm).not.toBeVisible()
  }

  async getAmountButtonsCount(): Promise<number> {
    return await this.amountButtons.count()
  }

  async verifyAmountButtons() {
    // Should have 5 amount buttons (1, 2, 10, 50, 100 PAS)
    await expect(this.amountButtons).toHaveCount(5)
  }

  async selectDonationAmount(index: number = 0) {
    await this.amountButtons.nth(index).click()
  }

  async getDonationAmounts(): Promise<string[]> {
    const count = await this.getAmountButtonsCount()
    const amounts: string[] = []
    for (let i = 0; i < count; i++) {
      const text = await this.getTextContent(this.amountButtons.nth(i))
      amounts.push(text)
    }
    return amounts
  }

  async isDonating(): Promise<boolean> {
    return await this.isElementVisible(this.donatingButton, 2000)
  }

  async isSuccessful(): Promise<boolean> {
    return await this.isElementVisible(this.successMessage, 5000)
  }

  async isPending(): Promise<boolean> {
    return await this.isElementVisible(this.pendingStatus, 2000)
  }

  async getTransactionHash(): Promise<string> {
    await expect(this.txHash).toBeVisible()
    return await this.getTextContent(this.txHash)
  }

  async verifySuccessMessage() {
    await expect(this.successMessage).toBeVisible({timeout: 15000})
  }

  async verifyErrorMessage() {
    await expect(this.errorBox).toBeVisible()
  }

  async areButtonsDisabled(): Promise<boolean> {
    const count = await this.getAmountButtonsCount()
    for (let i = 0; i < count; i++) {
      if (!(await this.amountButtons.nth(i).isDisabled())) {
        return false
      }
    }
    return true
  }
}
