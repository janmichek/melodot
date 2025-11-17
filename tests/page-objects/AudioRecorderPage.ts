import {expect, Locator, Page} from '@playwright/test'
import {BasePage} from './BasePage'

export class AudioRecorderPage extends BasePage {
  readonly recorderContainer: Locator
  readonly recordButton: Locator
  readonly stopButton: Locator
  readonly recordingIndicator: Locator
  readonly analyzingText: Locator
  readonly discoveryCard: Locator
  readonly searchAgainButton: Locator
  readonly noMatchMessage: Locator
  readonly errorBox: Locator

  constructor(page: Page) {
    super(page)
    this.recorderContainer = page.locator('.shazam-container')
    // Record button: button with start-bg class (not recording)
    this.recordButton = page.locator('button.audio-player-button:has(.audio-player-start-bg)').first()
    // Stop button: same button but with recording-bg class (when recording)
    this.stopButton = page.locator('button.audio-player-button:has(.audio-player-recording-bg)').first()
    this.recordingIndicator = page.locator('.audio-player-recording-pulse').first()
    this.analyzingText = page.locator('text=/analyzing|processing|identifying/i')
    this.discoveryCard = page.locator('.discovery-card, [class*="discovery"]')
    this.searchAgainButton = page.locator('button:has-text("Discover again"), button:has-text("Try Again")')
    this.noMatchMessage = page.locator('text=/no match found|could not identify|try again/i')
    this.errorBox = page.locator('.error-box, .shazam-error')
  }

  async grantMicrophonePermission() {
    await this.page.context().grantPermissions(['microphone'])
  }

  async verifyRecorderVisible() {
    await expect(this.recorderContainer).toBeVisible()
  }

  async verifyRecordButtonVisible() {
    await expect(this.recordButton).toBeVisible({timeout: 10000})
  }

  async startRecording() {
    await expect(this.recordButton).toBeVisible()
    await this.recordButton.click()
    // Wait a bit for the click to register and state to potentially update
    await this.page.waitForTimeout(500)
    // Wait for either recording to start (pulse indicators) or for permission request
    // The pulse indicators appear when recording actually starts
    // Permission is automatically granted by context.grantPermissions but MediaRecorder needs time
    try {
      await this.recordingIndicator.waitFor({state: 'visible', timeout: 5000})
    } catch {
      // If pulse doesn't appear, recording might not have started yet
      // This could be due to MediaRecorder initialization delay
      await this.page.waitForTimeout(1500)
    }
  }

  async stopRecording() {
    if (await this.isElementVisible(this.stopButton)) {
      await this.stopButton.click({force: true})
    }
  }

  async isRecording(): Promise<boolean> {
    // Check for pulse indicators first (most reliable indicator of recording state)
    const indicatorVisible = await this.isElementVisible(this.recordingIndicator, 3000)
    if (indicatorVisible) {return true}

    // Also check if the button has recording state (recording-bg class)
    const recordingButton = this.page.locator('button.audio-player-button:has(.audio-player-recording-bg)').first()
    const stopVisible = await this.isElementVisible(recordingButton, 3000)
    return stopVisible
  }

  async isAnalyzing(): Promise<boolean> {
    return await this.isElementVisible(this.analyzingText, 2000)
  }

  async isSongDiscovered(): Promise<boolean> {
    return await this.isElementVisible(this.discoveryCard)
  }

  async searchAgain() {
    await expect(this.searchAgainButton).toBeVisible()
    await expect(this.searchAgainButton).toBeEnabled()
    await this.searchAgainButton.click()
  }

  async verifyDiscoveryCard() {
    await expect(this.discoveryCard).toBeVisible({timeout: 15000})
  }

  async hasError(): Promise<boolean> {
    return await this.isElementVisible(this.errorBox, 2000)
  }
}
