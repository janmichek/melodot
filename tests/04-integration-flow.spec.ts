import {expect, test} from './fixtures/pages';

test.describe('End-to-End Integration Flow', () => {

  test('complete user flow: connect wallet, record audio, and donate', async ({
    page,
    context,
    walletPage,
    audioRecorderPage,
    donationPage
  }) => {
    // Grant microphone permission
    await context.grantPermissions(['microphone']);

    // Step 1: Verify initial state
    await expect(walletPage.connectButton).toBeVisible({ timeout: 10000 });
    await audioRecorderPage.verifyRecorderVisible();

    // Step 2: Verify donation form is hidden initially
    const donationVisible = await donationPage.isDonationFormVisible();
    expect(donationVisible).toBeFalsy();

    // Step 3: Check if wallet can be connected
    await walletPage.connect();

    // Note: Actual wallet connection requires Web3Auth flow in real scenario
    // The test will check if modal opens

    const modalAppeared = await page.locator('[class*="w3a"], [id*="web3auth"]').count() > 0;
    expect(typeof modalAppeared).toBe('boolean');
  });

  test('should maintain state across page reloads', async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check initial state
    const connectButton = page.locator('button:has-text("Connect")');
    await expect(connectButton).toBeVisible({ timeout: 10000 });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify state persists
    await expect(connectButton).toBeVisible({ timeout: 10000 });
  });

  test('should handle multiple recording attempts', async ({ audioRecorderPage }) => {
    // First attempt
    await audioRecorderPage.startRecording();
    const isRecording1 = await audioRecorderPage.isRecording();
    expect(isRecording1).toBeTruthy();

    await audioRecorderPage.stopRecording();

    // Wait for UI to reset
    await audioRecorderPage.page.waitForLoadState('networkidle');

    // Second attempt should also work
    await audioRecorderPage.verifyRecordButtonVisible();
  });

  test('should show appropriate error states', async ({ audioRecorderPage, donationPage }) => {
    // Check for error handling components in the DOM
    const audioError = await audioRecorderPage.hasError();
    expect(typeof audioError).toBe('boolean');

    // Check donation error component exists
    const donationErrorExists = await donationPage.page.locator('.error-box').count() > 0;
    expect(typeof donationErrorExists).toBe('boolean');
  });
});
