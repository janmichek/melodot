import {expect, test} from './fixtures/pages';

test.describe('Donation Flow', () => {

  test('should not show donation form on initial load', async ({ donationPage }) => {
    const isVisible = await donationPage.isDonationFormVisible();
    expect(isVisible).toBeFalsy();
  });

  test('should display donation amount buttons when visible', async ({ donationPage }) => {
    test.skip(!await donationPage.isDonationFormVisible(), 'No song identified');

    const amounts = await donationPage.getDonationAmounts();
    expect(amounts.length).toBeGreaterThan(0);
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

  test('should show success message after donation confirmation', async ({ donationPage }) => {
    test.skip(!await donationPage.isSuccessful(), 'No successful donation');

    await expect(donationPage.successMessage).toBeVisible();
  });
});
