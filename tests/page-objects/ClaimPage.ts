import type {Page} from '@playwright/test'
import {BasePage} from './BasePage'

export class ClaimPage extends BasePage {
  constructor(page: Page) {
    // @ts-expect-error test purposes
    super(page, '/claim')
  }

  // Locators
  get claimForm() {
    return this.page.locator('[data-testid="claim-form"], form')
  }

  get artistUrlInput() {
    return this.page.locator('input[placeholder*="open.spotify.com/artist"]')
  }

  get claimButton() {
    return this.page.locator('button:has-text("Claim")')
  }

  get demoClaimButton() {
    return this.page.locator('button:has-text("Demo")')
  }

  get verificationCode() {
    return this.page.locator('code').first()
  }

  get copyCodeButton() {
    return this.page.locator('button:has-text("Copy")')
  }

  get artistCard() {
    return this.page.locator('[data-testid="artist-card"]').or(
      this.page.locator('.rounded-lg').filter({has: this.page.locator('text=/PAS|balance/i')})
    )
  }

  get successMessage() {
    return this.page.locator('text=/successfully claimed/i')
  }

  get errorMessage() {
    return this.page.locator('[class*="destructive"]').or(
      this.page.locator('[role="alert"]').filter({hasText: /error|failed/i})
    )
  }

  get payoutForm() {
    return this.page.locator('form').filter({has: this.page.locator('text=/payout|withdraw/i')})
  }

  get payoutButton() {
    return this.page.locator('button:has-text("Payout"), button:has-text("Withdraw")')
  }

  get recipientAddressInput() {
    return this.page.locator('input[placeholder*="0x"], input[placeholder*="address"]')
  }

  get loadingSpinner() {
    return this.page.locator('.animate-spin').or(this.page.locator('[class*="spinner"]'))
  }

  get resetButton() {
    return this.page.locator('button[title="Reset"]')
  }

  get stepper() {
    return this.page.locator('.space-y-6').filter({has: this.page.locator('input[placeholder*="open.spotify.com"]')})
  }

  get signInButton() {
    return this.page.locator('main button:has-text("Sign In")')
  }

  async isWalletConnected(): Promise<boolean> {
    const hasSignInButton = await this.signInButton.isVisible({timeout: 3000}).catch(() => false)
    return !hasSignInButton
  }

  // Actions
  async enterArtistUrl(url: string) {
    await this.artistUrlInput.fill(url)
    await this.page.waitForTimeout(500) // Wait for debounce
  }

  async clickClaim() {
    await this.claimButton.click()
  }

  async clickDemoClaim() {
    await this.demoClaimButton.click()
  }

  async copyVerificationCode() {
    await this.copyCodeButton.click()
  }

  async clickReset() {
    await this.resetButton.click()
  }

  async enterRecipientAddress(address: string) {
    await this.recipientAddressInput.fill(address)
  }

  async clickPayout() {
    await this.payoutButton.click()
  }

  // Verification methods
  async isClaimFormVisible(): Promise<boolean> {
    return this.isElementVisible(this.claimForm, 2000)
  }

  async isArtistCardVisible(): Promise<boolean> {
    return this.isElementVisible(this.artistCard, 2000)
  }

  async isSuccessMessageVisible(): Promise<boolean> {
    return this.isElementVisible(this.successMessage, 2000)
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return this.isElementVisible(this.errorMessage, 2000)
  }

  async isPayoutFormVisible(): Promise<boolean> {
    return this.isElementVisible(this.payoutForm, 2000)
  }

  async waitForLoading() {
    await this.page.waitForTimeout(300)
    await this.page.waitForSelector('.animate-spin', {state: 'hidden', timeout: 10000}).catch(() => {})
  }

  async getStepStatus(stepNumber: number): Promise<string | null> {
    const step = this.page.locator(`[data-step="${stepNumber}"]`)
    return step.getAttribute('data-status').catch(() => null)
  }
}

