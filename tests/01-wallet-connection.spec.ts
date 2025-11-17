import {expect, test} from './fixtures/pages';

test.describe('Wallet Connection Flow', () => {

  test('should display Sign In button when wallet is not connected', async ({ walletPage }) => {
    await expect(walletPage.connectButton).toBeVisible({ timeout: 10000 });
    await walletPage.verifyWalletDisconnected();
  });

  test('should show Web3Auth modal when Sign In is clicked', async ({ walletPage }) => {
    await walletPage.connect();

    // Check for Web3Auth modal elements
    const modalVisible = await walletPage.page.locator('[class*="w3a"], [id*="web3auth"]').count() > 0;
    expect(modalVisible).toBeTruthy();
  });
});
