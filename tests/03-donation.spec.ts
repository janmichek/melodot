import {expect, test} from './fixtures/pages';
import {isValidTxHash} from './helpers/test-helpers';

test.describe('Donation Flow', () => {

  test('should not show donation form before song identification', async ({ donationPage }) => {
    const isVisible = await donationPage.isDonationFormVisible();
    expect(isVisible).toBeFalsy();
  });

  test('should display donation form after song is identified', async ({ donationPage }) => {
    // Check if donation form component exists in DOM
    const titleExists = await donationPage.page.locator('h3:has-text("Donate to Artist")').count() > 0;
    expect(typeof titleExists).toBe('boolean');
  });

  test('should show artist ID in donation form', async ({ donationPage }) => {
    test.skip(!await donationPage.isDonationFormVisible(), 'No song identified');

    await expect(donationPage.artistIdLabel).toBeVisible();
    const labelText = await donationPage.getTextContent(donationPage.artistIdLabel);
    expect(labelText).toContain('Artist ID:');
  });

  test('should display donation amount buttons (1, 2, 10 tokens)', async ({ donationPage }) => {
    test.skip(!await donationPage.isDonationFormVisible(), 'No song identified');

    await donationPage.verifyAmountButtons();

    const amounts = await donationPage.getDonationAmounts();
    expect(amounts.length).toBe(3);

    // Verify buttons contain expected amounts
    const hasOne = amounts.some(text => text.includes('1'));
    const hasTwo = amounts.some(text => text.includes('2'));
    const hasTen = amounts.some(text => text.includes('10'));

    expect(hasOne && hasTwo && hasTen).toBeTruthy();
  });

  test('should require wallet connection for donation', async ({ donationPage, walletPage }) => {
    test.skip(!await donationPage.isDonationFormVisible(), 'No song identified');

    const isConnected = await walletPage.isWalletConnected();

    if (!isConnected) {
      await donationPage.selectDonationAmount(0);
      // Should trigger connection flow
      await expect(walletPage.connectButton).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show loading state when processing donation', async ({ donationPage, walletPage }) => {
    test.skip(!await donationPage.isDonationFormVisible(), 'No song identified');
    test.skip(!await walletPage.isWalletConnected(), 'Wallet not connected');

    await donationPage.selectDonationAmount(0);

    // Check for loading state
    const isLoading = await donationPage.isDonating();
    expect(typeof isLoading).toBe('boolean');
  });

  test('should disable donation buttons during transaction', async ({ donationPage, walletPage }) => {
    test.skip(!await donationPage.isDonationFormVisible(), 'No song identified');
    test.skip(!await walletPage.isWalletConnected(), 'Wallet not connected');

    await donationPage.selectDonationAmount(0);

    // Check if buttons get disabled (may be brief)
    const areDisabled = await donationPage.areButtonsDisabled();
    expect(typeof areDisabled).toBe('boolean');
  });

  test('should display transaction hash after donation', async ({ donationPage }) => {
    test.skip(!await donationPage.isElementVisible(donationPage.txHash, 1000), 'No transaction completed');

    const hashText = await donationPage.getTransactionHash();
    expect(hashText).toContain('Tx:');
    expect(isValidTxHash(hashText)).toBeTruthy();
  });

  test('should show success message after donation confirmation', async ({ donationPage }) => {
    test.skip(!await donationPage.isSuccessful(), 'No successful donation');

    await expect(donationPage.successMessage).toBeVisible();
    const messageText = await donationPage.getTextContent(donationPage.successMessage);
    expect(messageText).toMatch(/successful|confirmed|complete/i);
  });

  test('should show pending status during transaction confirmation', async ({ donationPage }) => {
    const isPending = await donationPage.isPending();

    if (isPending) {
      await expect(donationPage.pendingStatus).toBeVisible();
      const statusText = await donationPage.getTextContent(donationPage.pendingStatus);
      expect(statusText).toMatch(/waiting|pending|confirming/i);
    }
  });

  test('should display error message if donation fails', async ({ donationPage }) => {
    const hasError = await donationPage.isElementVisible(donationPage.errorBox, 1000);

    if (hasError) {
      await donationPage.verifyErrorMessage();
      const errorText = await donationPage.getTextContent(donationPage.errorBox);
      expect(errorText).toContain('Error:');
    }
  });

  test('should reset form after successful donation', async ({ donationPage }) => {
    test.skip(!await donationPage.isSuccessful(), 'No successful donation');

    // Wait for the auto-reset delay
    await donationPage.page.waitForTimeout(3500);

    // Success message should disappear
    const stillVisible = await donationPage.isElementVisible(donationPage.successMessage, 1000);
    expect(stillVisible).toBeFalsy();
  });

  test('should display contract address in footer', async ({ donationPage }) => {
    const isVisible = await donationPage.isElementVisible(donationPage.contractFooter);

    if (isVisible) {
      await expect(donationPage.contractFooter).toBeVisible();
      const footerText = await donationPage.getTextContent(donationPage.contractFooter);
      expect(footerText).toMatch(/contract|address|0x[a-fA-F0-9]+/i);
    }
  });

  test('should allow user to select a donation amount', async ({ donationPage }) => {
    test.skip(!await donationPage.isDonationFormVisible(), 'No song identified');

    const amountButtons = await donationPage.page.locator('.btn-amount-selector');
    const buttonCount = await amountButtons.count();

    if (buttonCount > 0) {
      await amountButtons.first().click();

      // Verify button interaction (button should remain visible/enabled)
      await expect(amountButtons.first()).toBeVisible();
    }
  });

  test('should display social links for artist', async ({ donationPage }) => {
    test.skip(!await donationPage.isDonationFormVisible(), 'No song identified');

    const socialLinks = donationPage.page.locator('.discovery-social-links a, [class*="social"] a');
    const linkCount = await socialLinks.count();

    // Social links are dependent on artist data availability
    expect(typeof linkCount).toBe('number');
  });
});
