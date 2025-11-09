import {expect, Locator, Page} from '@playwright/test';
import {BasePage} from './BasePage';

export class AudioRecorderPage extends BasePage {
  readonly recorderContainer: Locator;
  readonly recordButton: Locator;
  readonly stopButton: Locator;
  readonly recordingIndicator: Locator;
  readonly analyzingText: Locator;
  readonly discoveryCard: Locator;
  readonly searchAgainButton: Locator;
  readonly noMatchMessage: Locator;
  readonly errorBox: Locator;

  constructor(page: Page) {
    super(page);
    this.recorderContainer = page.locator('.shazam-container');
    this.recordButton = page.locator('button.record-button, button:has-text("Listen")').first();
    this.stopButton = page.locator('button.stop-button, button:has-text("Stop")');
    this.recordingIndicator = page.locator('.recording-active, .pulse, [class*="recording"]');
    this.analyzingText = page.locator('text=/analyzing|processing|identifying/i');
    this.discoveryCard = page.locator('.discovery-card, [class*="discovery"]');
    this.searchAgainButton = page.locator('button:has-text("Search Again"), button:has-text("Try Again")');
    this.noMatchMessage = page.locator('text=/no match found|could not identify|try again/i');
    this.errorBox = page.locator('.error-box, .shazam-error');
  }

  async grantMicrophonePermission() {
    await this.page.context().grantPermissions(['microphone']);
  }

  async verifyRecorderVisible() {
    await expect(this.recorderContainer).toBeVisible();
  }

  async verifyRecordButtonVisible() {
    await expect(this.recordButton).toBeVisible({ timeout: 10000 });
  }

  async startRecording() {
    await expect(this.recordButton).toBeVisible();
    await this.recordButton.click();
  }

  async stopRecording() {
    if (await this.isElementVisible(this.stopButton)) {
      await this.stopButton.click();
    }
  }

  async isRecording(): Promise<boolean> {
    const stopVisible = await this.isElementVisible(this.stopButton, 1000);
    const indicatorVisible = await this.isElementVisible(this.recordingIndicator, 1000);
    return stopVisible || indicatorVisible;
  }

  async isAnalyzing(): Promise<boolean> {
    return await this.isElementVisible(this.analyzingText, 2000);
  }

  async isSongDiscovered(): Promise<boolean> {
    return await this.isElementVisible(this.discoveryCard);
  }

  async searchAgain() {
    await expect(this.searchAgainButton).toBeVisible();
    await expect(this.searchAgainButton).toBeEnabled();
    await this.searchAgainButton.click();
  }

  async verifyDiscoveryCard() {
    await expect(this.discoveryCard).toBeVisible({ timeout: 15000 });
  }

  async hasError(): Promise<boolean> {
    return await this.isElementVisible(this.errorBox, 2000);
  }
}
