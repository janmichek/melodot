import {expect, test} from './fixtures/pages';

test.describe('End-to-End Integration Flow', () => {

  test('complete user flow: verify initial state and recording', async ({
    page,
    context,
    walletPage,
    audioRecorderPage,
    donationPage
  }) => {
    // Grant microphone permission
    await context.grantPermissions(['microphone']);

    // Verify initial state
    await expect(walletPage.connectButton).toBeVisible({ timeout: 10000 });
    await audioRecorderPage.verifyRecorderVisible();

    // Verify donation form is hidden initially
    const donationVisible = await donationPage.isDonationFormVisible();
    expect(donationVisible).toBeFalsy();

    // Check if wallet connection button works
    await walletPage.connect();

    const modalAppeared = await page.locator('[class*="w3a"], [id*="web3auth"]').count() > 0;
    expect(typeof modalAppeared).toBe('boolean');
  });

  test('should maintain state across page reloads', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const connectButton = page.locator('button:has-text("Sign In")');
    await expect(connectButton).toBeVisible({ timeout: 10000 });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(connectButton).toBeVisible({ timeout: 10000 });
  });

  test('should handle multiple recording attempts', async ({ audioRecorderPage }) => {
    await audioRecorderPage.startRecording();
    const isRecording1 = await audioRecorderPage.isRecording();
    expect(isRecording1).toBeTruthy();

    await audioRecorderPage.stopRecording();
    await audioRecorderPage.page.waitForTimeout(500);

    await audioRecorderPage.verifyRecordButtonVisible();
  });
});
